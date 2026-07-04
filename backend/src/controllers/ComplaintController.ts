import { Request, Response } from 'express';
import logger from '@/utils/logger';
import { complaintService } from '@/services/ComplaintService';
import { AuthRequest } from '@/middleware/auth';
import { Complaint, ComplaintCategory, ComplaintStatus, CreateComplaintRequest } from '@shared/types';

export class ComplaintController {
  async createComplaint(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = req.body as CreateComplaintRequest;
      const complaint = await complaintService.createComplaint(req.user.id, data);

      setTimeout(async () => {
        try {
          await complaintService.analyzeAndReply(complaint._id!);
        } catch (error) {
          logger.error('Background analysis failed:', error);
        }
      }, 100);

      res.status(201).json(complaint);
    } catch (error) {
      logger.error('Create complaint failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getComplaints(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const isAdminOrOperator = req.user?.role === 'admin' || req.user?.role === 'operator';

      const query: any = {
        status: req.query.status as ComplaintStatus,
        category: req.query.category as ComplaintCategory,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      if (!isAdminOrOperator && userId) {
        query.userId = userId;
      }

      const result = await complaintService.getComplaints(query);
      res.json(result);
    } catch (error) {
      logger.error('Get complaints failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getComplaintById(req: AuthRequest, res: Response) {
    try {
      const complaint = await complaintService.getComplaintById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      const isAdminOrOperator = req.user?.role === 'admin' || req.user?.role === 'operator';
      if (!isAdminOrOperator && complaint.userId.toString() !== req.user?.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(complaint);
    } catch (error) {
      logger.error('Get complaint failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const complaint = await complaintService.updateStatus(req.params.id, req.body);

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json(complaint);
    } catch (error) {
      logger.error('Update status failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async addManualReply(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const complaint = await complaintService.addManualReply(
        req.params.id,
        req.body.content,
        req.user.id
      );

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json(complaint);
    } catch (error) {
      logger.error('Add manual reply failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async submitSatisfaction(req: AuthRequest, res: Response) {
    try {
      const complaint = await complaintService.submitSatisfaction(
        req.params.id,
        req.body.rating
      );

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json(complaint);
    } catch (error) {
      logger.error('Submit satisfaction failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async deleteComplaint(req: AuthRequest, res: Response) {
    try {
      await complaintService.deleteComplaint(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Delete complaint failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export const complaintController = new ComplaintController();