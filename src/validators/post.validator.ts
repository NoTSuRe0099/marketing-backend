import Joi from 'joi';

export const createPostValidation = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string()
});

export const updatePostValidation = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string()
});
