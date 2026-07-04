import { Router } from 'express';
import userRoutes from './userRoutes';
import complaintRoutes from './complaintRoutes';
import replyTemplateRoutes from './replyTemplateRoutes';
import statisticsRoutes from './statisticsRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/complaints', complaintRoutes);
router.use('/reply-templates', replyTemplateRoutes);
router.use('/statistics', statisticsRoutes);

export default router;