const Joi = require('joi');

const roleValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must be at least 3 characters long',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email must be valid',
      'string.empty': 'Email is required',
    }),
    password: Joi.string()
      .min(6)
      .pattern(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base':
          'Password must include uppercase, lowercase, number, and special character',
      }),
    isVerified: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'isVerified must be a boolean value',
      }),
    role: Joi.string()
      .valid('admin', 'manager', 'user')
      .optional()
      .messages({
        'any.only': 'Role must be one of admin, manager, or user',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must be at least 3 characters long',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email must be valid',
      'string.empty': 'Email is required',
    }),
    password: Joi.string()
      .min(6)
      .pattern(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .required()
      .messages({
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password must be at least 6 characters long',
        'string.pattern.base':
          'Password must include uppercase, lowercase, number, and special character',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};


module.exports = { roleValidation , loginValidation};
