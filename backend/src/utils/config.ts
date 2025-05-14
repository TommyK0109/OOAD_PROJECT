import dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/movie-watch-party',
  jwtSecret: (process.env.JWT_SECRET || 'your-default-secret-key') as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development'
};