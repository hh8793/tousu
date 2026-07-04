import { Request, Response } from 'express';
import logger from '@/utils/logger';
import { userService } from '@/services/UserService';
import { AuthRequest } from '@/middleware/auth';
import { User, UserRole } from '@shared/types';

export class UserController {
  async register(req: Request, res: Response) {
    try {
      const userData = req.body as Omit<User, '_id' | 'createdAt' | 'updatedAt'>;
      const user = await userService.register(userData);
      res.status(201).json(user);
    } catch (error) {
      logger.error('Registration failed:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const loginData = req.body;
      const result = await userService.login(loginData);
      res.json(result);
    } catch (error) {
      logger.error('Login failed:', error);
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Get profile failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const role = req.query.role as UserRole;
      const users = await userService.getAllUsers(role);
      res.json(users);
    } catch (error) {
      logger.error('Get users failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const user = await userService.updateUser(userId, updateData);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Update user failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.params.id;
      await userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      logger.error('Delete user failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export const userController = new UserController();