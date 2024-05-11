import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": 'Field "name" is required',
    "string.empty": 'Field "name" cannot be empty',
    "string.min": 'Field "name" must be at least 3 characters long',
    "string.max": 'Field "name" must be at most 30 characters long',
  }),
  email: Joi.string().email().required().messages({
    "any.required": 'Field "email" is required',
    "string.empty": 'Field "email" cannot be empty',
    "string.email": 'Field "email" must be a valid email address',
  }),
  phone: Joi.string().min(6).required().messages({
    "any.required": 'Field "phone" is required',
    "string.empty": 'Field "phone" cannot be empty',
    "string.min": 'Field "name" must be at least 6 characters long',
  }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).message({
    "string.min": 'Field "name" must be at least 3 characters long',
    "string.max": 'Field "name" must be at most 30 characters long',
  }),
  email: Joi.string().email().message({
    "string.email": 'Field "email" must be a valid email address',
  }),
  phone: Joi.string().min(6).message({
    "string.min": 'Field "name" must be at least 6 characters long',
  }),
});
