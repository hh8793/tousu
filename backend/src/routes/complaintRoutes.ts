import { Router } from 'express';
import { complaintController } from '@/controllers/ComplaintController';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@shared/types';

const router = Router();

router.post('/', authenticate, complaintController.createComplaint);
router.get('/', authenticate, complaintController.getComplaints);
router.get('/:id', authenticate, complaintController.getComplaintById);
router.put('/:id/status', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), complaintController.updateStatus);
router.post('/:id/reply', authenticate, authorize([UserRole.ADMIN, UserRole.OPERATOR]), complaintController.addManualReply);
router.post('/:id/satisfaction', authenticate, complaintController.submitSatisfaction);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), complaintController.deleteComplaint);

export default router;