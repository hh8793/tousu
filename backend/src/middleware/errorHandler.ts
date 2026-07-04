import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

export interface ErrorResponse {
  error: string;
  message: string;
  stack?: string;
}

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', error);

  const statusCode = error.statusCode || 500;
  const response: ErrorResponse = {
    error: error.name || 'InternalServerError',
    message: error.message || 'An unexpected error occurred'
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found`
  });
};