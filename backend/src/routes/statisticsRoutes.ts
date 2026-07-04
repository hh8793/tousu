import { Router } from 'express';
import { statisticsController } from '@/controllers/StatisticsController';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@shared/types';

const router = Router();

router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), statisticsController.getStatistics);

export default router;