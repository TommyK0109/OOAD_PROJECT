import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from './errorMiddleware';
import { config } from '../utils/config';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      throw new AppError('Not authorized to access this route', 401);
    }
  } catch (error) {
    next(error);
  }
};