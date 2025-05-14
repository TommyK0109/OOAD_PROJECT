import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { config } from '../utils/config';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Don't expose stack trace in production
  const response = {
    success: false,
    message,
    stack: config.nodeEnv === 'production' ? undefined : err.stack
  };
  
  res.status(statusCode).json(response);
};