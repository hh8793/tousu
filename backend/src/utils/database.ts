import mongoose from 'mongoose';
import { config } from '@/config';
import logger from '@/utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Successfully connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB error:', error);
});