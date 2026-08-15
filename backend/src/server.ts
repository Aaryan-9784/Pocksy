/**
 * Pocksy Server entry point
 * Connects to MongoDB then starts Express
 */

import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function startServer(): Promise<void> {
  // Connect to MongoDB
  await connectDB();

  // Start Express server
  app.listen(env.PORT, () => {
    console.log(`\n🚀 Pocksy API running on port ${env.PORT}`);
    console.log(`📍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Health: http://localhost:${env.PORT}/api/health\n`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
