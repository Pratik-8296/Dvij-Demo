import Joi from 'joi';

export const createEventSchema = Joi.object({
  eventName: Joi.string().trim().min(3).max(100).required(),
  location: Joi.string().trim().min(3).max(100).required(),
  eventDate: Joi.date().iso().required(),
  capacity: Joi.number().integer().greater(0).required(),
  ticketPrice: Joi.number().min(0).required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
});

export const queryEventsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  sortBy: Joi.string().valid('eventName', 'eventDate', 'ticketPrice', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
  location: Joi.string().trim(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  eventDate: Joi.date().iso(),
});
