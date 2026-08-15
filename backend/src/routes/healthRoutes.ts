/**
 * Health check routes
 */

import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  ApiResponse.success(res, 'Pocksy API is running', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;
