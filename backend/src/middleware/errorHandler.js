import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => ({ field: e.path, message: e.message }));
      error = new ApiError(400, 'Validation failed', errors);
    } else if (error.name === 'CastError') {
      error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      error = new ApiError(409, `Duplicate value for ${field}`);
    } else if (error.name === 'JsonWebTokenError') {
      error = new ApiError(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      error = new ApiError(401, 'Token expired');
    } else {
      error = new ApiError(error.statusCode || 500, error.message || 'Server error');
    }
  }

  if (!error.isOperational || error.statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors?.length ? error.errors : undefined,
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};
