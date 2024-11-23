/**
 * Imported Libraries
 */
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const util = require("util");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const dotenv = require("dotenv");
const colors = require("colors");
const connectDB = require('./app/utils/config/database');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

/**
 * Configuration
 */
require('dotenv').config();

/**
 * Server Configuration
 */
// init app
const app = express();
connectDB();
app.use(cors());

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// body-parser middleware
app.use(bodyParser.json());
// dev log middleware
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

/**
 * Managing Routes
 */
app.get("/App", function (req, res) {
  res.json({
    Tutorial: "Build REST API with Node.JS & MongoDB!!",
  });
});


/**
 * Handling 404, 500 Errors
 */
app.use(function (err, req, res, next) {
  if (err.status === 404)
    res.status(404).json({
      message: "Not found",
    });
  else
    res.status(500).json({
      message: "Internal Server Error",
      err: util.inspect(err),
    });
});

// Routes
const authRoutes = require('./app/routes/auth.routes');
app.use('/v1/auth/role', authRoutes);

const taskRoutes = require('./app/routes/task.routes')
app.use('/api/task', taskRoutes);

// Your routes go here
app.get("/", (req, res) => {
  res.send("API is running...");
});
/**
 * Server Connection
 */
const PORT = process.env.PORT || 5001;
// // Local Server
const server = app.listen(PORT, function () {
  console.log(
    `${process.env.NODE_ENV} Application running locally at  http://localhost:${PORT}`
      .yellow.bold
  );
});

