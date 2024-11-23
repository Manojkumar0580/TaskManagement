const Joi = require('joi');

const taskValidationSchema = Joi.object({
    title: Joi.string()
        .required()
        .messages({
            'string.base': '"Title" should be a type of text',
            'string.empty': '"Title" cannot be an empty field',
            'any.required': '"Title" is a required field'
        }),
    
    description: Joi.string()
        .required()
        .messages({
            'string.base': '"Description" should be a type of text',
            'string.empty': '"Description" cannot be an empty field',
            'any.required': '"Description" is a required field'
        }),

    dueDate: Joi.date()
        .required()
        .messages({
            'date.base': '"Due Date" should be a valid date',
            'any.required': '"Due Date" is a required field'
        }),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium')
        .messages({
            'any.only': '"Priority" must be one of ["low", "medium", "high"]'
        }),

    status: Joi.string()
        .valid('pending', 'in-progress', 'completed')
        .default('pending')
        .messages({
            'any.only': '"Status" must be one of ["pending", "in-progress", "completed"]'
        }),

    assignedTo: Joi.string()
        .optional()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': '"Assigned To" must be a valid ObjectId'
        }),

    createdBy: Joi.string()
        .optional()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': '"Created By" must be a valid ObjectId'
        })
});

module.exports = taskValidationSchema;
