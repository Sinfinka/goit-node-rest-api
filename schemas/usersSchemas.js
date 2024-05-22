import Joi from "joi";

export const createUserSchema = Joi.object({
  password: Joi.string().min(3).max(30).required().messages({
    "any.required": 'Field "password" is required',
    "string.empty": 'Field "password" cannot be empty',
    "string.min": 'Field "password" must be at least 3 characters long',
    "string.max": 'Field "password" must be at most 30 characters long',
  }),
  email: Joi.string().email().lowercase().required().messages({
    "any.required": 'Field "email" is required',
    "string.empty": 'Field "email" cannot be empty',
    "string.email": 'Field "email" must be a valid email address',
  }),
  subscription: Joi.string()
    .valid("starter", "pro", "business")
    .default("starter")
    .messages({
      "any.only": 'Subscription must be one of "starter", "pro", or "business"',
    }),
});

export const loginUserSchema = Joi.object({
  password: Joi.string().min(3).max(30).required().messages({
    "any.required": 'Field "password" is required',
    "string.empty": 'Field "password" cannot be empty',
    "string.min": 'Field "password" must be at least 3 characters long',
    "string.max": 'Field "password" must be at most 30 characters long',
  }),
  email: Joi.string().email().lowercase().required().messages({
    "any.required": 'Field "email" is required',
    "string.empty": 'Field "email" cannot be empty',
    "string.email": 'Field "email" must be a valid email address',
  }),
});

export const userSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").messages({
    "any.only": 'Subscription must be one of "starter", "pro", or "business"',
  }),
});
