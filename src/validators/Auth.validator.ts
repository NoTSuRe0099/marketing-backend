import Joi from 'joi';

export const registerValidation = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(200).required(),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(200).required(),
});
