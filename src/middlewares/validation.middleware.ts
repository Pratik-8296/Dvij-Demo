import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Schema } from 'joi';
import { AppError } from './error.middleware';

/**
 * Validation Middleware using Joi.
 * Validates request data against a schema and handles formatting of validation errors.
 */
export const validate = (
  schema: Schema,
  source: 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''), // Strip quotes for cleaner output
      }));

      return next(new AppError('Validation failed', 400, errorDetails));
    }

    // Overwrite the request object property with validated and cast values
    req[source] = value;
    next();
  };
};

export default validate;
