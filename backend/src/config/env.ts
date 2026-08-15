/**
 * Environment configuration with validation
 */

import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
}

function getEnv(): EnvConfig {
  const { PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRE } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required in environment variables');
  }

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required in environment variables');
  }

  return {
    PORT: parseInt(PORT || '5000', 10),
    NODE_ENV: NODE_ENV || 'development',
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRE: JWT_EXPIRE || '30d',
  };
}

export const env = getEnv();
