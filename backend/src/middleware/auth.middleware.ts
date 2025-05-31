import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const decoded = verifyToken(token);
    req.user = decoded;

    return next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      const decoded = verifyToken(token);
      req.user = decoded;
    }

    return next();
  } catch (error) {
    return next();
  }
}
