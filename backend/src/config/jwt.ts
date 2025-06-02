import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  username: string;
  role?: string;
}

export function generateToken(payload: JWTPayload): string {
  console.log('🔑 JWT_SECRET being used for token generation:', JWT_SECRET.substring(0, 10) + '...');
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    console.log('🔑 JWT_SECRET being used for token verification:', JWT_SECRET.substring(0, 10) + '...');
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw error;
  }
}