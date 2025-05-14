import mongoose from 'mongoose';
import { config } from './config';
import logger from './logger';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};