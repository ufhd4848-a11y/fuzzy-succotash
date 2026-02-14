import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../types';
import logger from '../config/logger';

/**
 * Handle Zod validation errors
 */
const handleZodError = (err: ZodError) => {
  const errors = err.errors.map((error) => ({
    path: error.path.join('.'),
    message: error.message,
  }));

  return {
    statusCode: 400,
    message: 'Validation error',
    errors,
  };
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => ({
  statusCode: 401,
  message: 'Invalid token. Please log in again.',
});

/**
 * Handle JWT expired error
 */
const handleJWTExpiredError = () => ({
  statusCode: 401,
  message: 'Your token has expired. Please log in again.',
});

/**
 * Handle Prisma errors
 */
const handlePrismaError = (err: any) => {
  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return {
      statusCode: 409,
      message: `${field} already exists`,
    };
  }

  // Prisma foreign key constraint violation
  if (err.code === 'P2003') {
    return {
      statusCode: 400,
      message: 'Referenced record does not exist',
    };
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return {
      statusCode: 404,
      message: 'Record not found',
    };
  }

  return {
    statusCode: 500,
    message: 'Database error',
  };
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: any[] | undefined;

  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Handle specific error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    const zodError = handleZodError(err);
    statusCode = zodError.statusCode;
    message = zodError.message;
    errors = zodError.errors;
  } else if (err.name === 'JsonWebTokenError') {
    const jwtError = handleJWTError();
    statusCode = jwtError.statusCode;
    message = jwtError.message;
  } else if (err.name === 'TokenExpiredError') {
    const jwtExpiredError = handleJWTExpiredError();
    statusCode = jwtExpiredError.statusCode;
    message = jwtExpiredError.message;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = handlePrismaError(err);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

/**
 * Async handler wrapper
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};