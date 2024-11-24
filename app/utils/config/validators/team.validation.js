const Joi = require("joi");

const objectId = Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Invalid ObjectId format.");

const teamValidator = {
    create: Joi.object({
        teamName: Joi.string()
            .min(3)
            .max(100)
            .required()
            .messages({
                "string.empty": "Team name is required.",
                "string.min": "Team name must be at least 3 characters long.",
                "string.max": "Team name cannot exceed 100 characters.",
            }),
        teamMembers: Joi.array()
            .items(objectId)
            .optional()
            .messages({
                "array.base": "Team members must be an array of valid ObjectIds.",
                "string.pattern.base": "Each team member must be a valid ObjectId.",
            }),
        // createdBy: objectId.required().messages({
        //     "string.empty": "Created by is required.",
        //     "string.pattern.base": "Invalid ObjectId format for createdBy.",
        // }),
    }),
    update: Joi.object({
        teamName: Joi.string().min(3).max(100).optional(),
        teamMembers: Joi.array().items(objectId).optional(),
        createdBy: objectId.optional(),
    }),
};

module.exports = teamValidator;
