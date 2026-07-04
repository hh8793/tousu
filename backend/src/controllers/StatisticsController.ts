import { Request, Response } from 'express';
import logger from '@/utils/logger';
import { statisticsService } from '@/services/StatisticsService';

export class StatisticsController {
  async getStatistics(req: Request, res: Response) {
    try {
      const stats = await statisticsService.getStatistics();
      res.json(stats);
    } catch (error) {
      logger.error('Get statistics failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export const statisticsController = new StatisticsController();