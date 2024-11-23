const mongoose = require('mongoose');
const { ENVIRONMENTS } = require("./constatnts");

const connectDB = async () => {
    try {
    
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            // serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        // Connection success message
        console.log(`MongoDB connected to ${conn.connection.name} database`);

        // Additional environment-specific settings
        if (process.env.ENVIRONMENT === ENVIRONMENTS.DEVELOPMENT) {
            mongoose.set("debug", true);
        }

    } catch (err) {
        // Handle connection error
        console.error('Error connecting to MongoDB:', err);
    }
};

module.exports = connectDB;
