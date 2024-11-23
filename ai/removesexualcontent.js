// Import required libraries
const AWS = require("aws-sdk");
const nsfw = require("nsfwjs");
const tf = require("@tensorflow/tfjs"); // TensorFlow.js for Node.js
const cocoSsd = require("@tensorflow-models/coco-ssd"); // COCO SSD object detection model
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const csvWriter = require("csv-write-stream"); // CSV writer library
let writer;

// AWS S3 Setup
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY,
	region: process.env.AWS_REGION, // Update with your region
});

// S3 Bucket Name
const BUCKET_NAME = process.env.AWS_BUCKET_NAME; // Replace with your actual bucket name

// Load NSFW model and COCO SSD model globally
let nsfwModel;
let objectDetectionModel;

async function loadModels() {
	nsfwModel = await nsfw.load(); // Load NSFW detection model
	objectDetectionModel = await cocoSsd.load(); // Load COCO SSD object detection model
}

// Initialize CSV Writer (Append mode)
function initCSVWriter() {
	if (!fs.existsSync(__dirname + "/AiResult/detected_images.csv")) {
		writer = csvWriter({ headers: ["imageName", "key", "bucket"] });
		writer.pipe(fs.createWriteStream(__dirname + "/AiResult/detected_images.csv"));
	} else {
		writer = csvWriter({ sendHeaders: false }); // No headers if the file exists
		writer.pipe(fs.createWriteStream(__dirname + "/AiResult/detected_images.csv", { flags: "a" }));
	}
}

// Function to download image from S3
async function downloadImageFromS3(key) {
	const params = {
		Bucket: BUCKET_NAME,
		Key: key,
	};

	const imageData = await s3.getObject(params).promise();

	// Save the image temporarily
	const localImagePath = path.join(__dirname, key);
	fs.writeFileSync(localImagePath, imageData.Body);

	return localImagePath;
}

// Function to detect sexual content using nsfwjs
async function detectSexualContent(imagePath) {
	try {
		const imageBuffer = fs.readFileSync(imagePath);
		const imageTensor = tf.node.decodeImage(imageBuffer, 3); // Decode the image to Tensor
		const predictions = await nsfwModel.classify(imageTensor);

		imageTensor.dispose(); // Dispose tensor to free memory

		console.log(`NSFW Predictions for ${imagePath}:`, predictions);

		const nsfwCategories = ["Porn", "Hentai", "Sexy"];
		const hasExplicitContent = predictions.some((pred) => nsfwCategories.includes(pred.className) && pred.probability > 0.8);

		return hasExplicitContent;
	} catch (err) {
		console.error("Error detecting sexual content:", err);
		return false;
	}
}

// Function to detect cars, bikes, and humans using COCO SSD
async function detectObjects(imagePath) {
	try {
		const imageBuffer = fs.readFileSync(imagePath);
		const imageTensor = tf.node.decodeImage(imageBuffer, 3); // Decode image to Tensor
		const predictions = await objectDetectionModel.detect(imageTensor);

		imageTensor.dispose(); // Dispose tensor to free memory

		console.log(`Object Predictions for ${imagePath}:`, predictions);

		// Check for car, bicycle, or motorcycle
		const vehicleObjects = ["car", "bicycle", "motorcycle"];
		const containsVehicle = predictions.some((pred) => vehicleObjects.includes(pred.class) && pred.score > 0.6);

		const containsHuman = predictions.some((pred) => pred.class === "person" && pred.score > 0.6);

		return { containsVehicle, containsHuman };
	} catch (err) {
		console.error("Error detecting objects:", err);
		return { containsVehicle: false, containsHuman: false };
	}
}

// Function to process images from S3 bucket
async function processImagesFromS3() {
	try {
		// List objects in the S3 bucket
		const s3Objects = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();
		const imageKeys = s3Objects.Contents.map((obj) => obj.Key);

		for (let key of imageKeys) {
			// Download each image
			const imagePath = await downloadImageFromS3(key);

			// Detect cars, bikes, and humans
			const { containsVehicle, containsHuman } = await detectObjects(imagePath);

			if (containsVehicle) {
				console.log(`Image ${key} contains a car or bike. Skipping.`);
				fs.unlinkSync(imagePath); // Clean up the local file
				continue; // Skip NSFW detection if it's a vehicle
			}

			if (containsHuman) {
				console.log(`Image ${key} contains a human. Running NSFW detection...`);
				const hasExplicitContent = await detectSexualContent(imagePath);

				if (hasExplicitContent) {
					console.log(`Image ${key} contains explicit content. Logging to CSV and taking action...`);

					// Log image details to CSV
					writer.write({ imageName: path.basename(imagePath), key: key, bucket: BUCKET_NAME });

					// Optionally, delete or move the image in the S3 bucket
					await deleteImageFromS3(key);
				} else {
					console.log(`Image ${key} is clean.`);
				}
			} else {
				console.log(`Image ${key} does not contain a human. Skipping NSFW detection.`);
			}

			// Clean up the local file
			fs.unlinkSync(imagePath);
		}
	} catch (err) {
		console.error("Error processing images from S3:", err);
	}
}

// Function to delete image from S3 bucket
async function deleteImageFromS3(key) {
	const params = {
		Bucket: BUCKET_NAME,
		Key: key,
	};

	await s3.deleteObject(params).promise();
	console.log(`Deleted image ${key} from S3.`);
}

// Schedule a cron job to run every hour
// cron.schedule("* * * * *", () => {
// 	console.log("Running cron job to process images from S3...");
// 	processImagesFromS3();
// });

// Load models and start the cron job
// loadModels().then(() => {
// 	console.log("NSFW and Object Detection models loaded. Cron job scheduled.");
// 	initCSVWriter(); // Initialize the CSV writer
// });
