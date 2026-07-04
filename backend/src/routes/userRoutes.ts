import { Router } from 'express';
import { userController } from '@/controllers/UserController';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@shared/types';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticate, userController.getProfile);
router.get('/', authenticate, authorize([UserRole.ADMIN]), userController.getAllUsers);
router.put('/:id', authenticate, authorize([UserRole.ADMIN]), userController.updateUser);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), userController.deleteUser);

export default router;