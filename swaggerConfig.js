const swaggerJSDoc = require("swagger-jsdoc");
const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Task_Management_System",
        version: "1.0.0",
        description: "Documentation for the REST API built with Node.js",
      },
      servers: [
        {
          url: "http://localhost:5001", // Your server URL
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ["./app/routes/*.js"],
  };
  
  const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;