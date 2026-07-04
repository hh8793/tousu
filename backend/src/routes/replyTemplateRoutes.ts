import { Router } from 'express';
import { replyTemplateController } from '@/controllers/ReplyTemplateController';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@shared/types';

const router = Router();

router.post('/', authenticate, authorize([UserRole.ADMIN]), replyTemplateController.createTemplate);
router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), replyTemplateController.getTemplates);
router.get('/:id', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), replyTemplateController.getTemplateById);
router.put('/:id', authenticate, authorize([UserRole.ADMIN]), replyTemplateController.updateTemplate);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), replyTemplateController.deleteTemplate);
router.patch('/:id/toggle', authenticate, authorize([UserRole.ADMIN]), replyTemplateController.toggleStatus);

export default router;