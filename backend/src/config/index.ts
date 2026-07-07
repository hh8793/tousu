import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  mongoUri: process.env.MONGODB_URI || (isProduction ? 'mongodb://mongodb.railway.internal:27017/complaint-management' : 'mongodb://localhost:27017/complaint-management'),
  jwtSecret: process.env.JWT_SECRET || 'railway-production-jwt-secret-key-32-characters-minimum-length',
  jwtExpiresIn: '7d',
  openClaw: {
    apiUrl: process.env.OPENCLAW_API_URL || 'http://localhost:8080/api/v1',
    apiKey: process.env.OPENCLAW_API_KEY || '',
    timeout: parseInt(process.env.OPENCLAW_TIMEOUT || '3000'),
    retryCount: parseInt(process.env.OPENCLAW_RETRY_COUNT || '3')
  },
  environment: process.env.NODE_ENV || 'development'
};