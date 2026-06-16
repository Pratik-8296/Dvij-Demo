import { Request, Response, NextFunction } from 'express';

/**
 * Custom AppError to throw operational errors with status codes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: any[];

  constructor(message: string, statusCode: number = 500, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express Error Handling Middleware.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  // Log error for developers (exclude test environment to avoid noisy logs)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} - ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorHandler;
