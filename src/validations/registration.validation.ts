import Joi from 'joi';

export const createRegistrationSchema = Joi.object({
  eventId: Joi.number().integer().positive().required(),
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  tickets: Joi.number().integer().positive().required(),
});

export const queryRegistrationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  sortBy: Joi.string().valid('registrationNumber', 'fullName', 'email', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
  eventId: Joi.number().integer().positive(),
  status: Joi.string().valid('REGISTERED', 'CANCELLED', 'WAITLIST'),
  registrationDate: Joi.date().iso(),
});
