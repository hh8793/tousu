import { Request, Response } from 'express';
import logger from '@/utils/logger';
import { replyTemplateService } from '@/services/ReplyTemplateService';
import { ComplaintCategory, ReplyTemplateRequest } from '@shared/types';

export class ReplyTemplateController {
  async createTemplate(req: Request, res: Response) {
    try {
      const data = req.body as ReplyTemplateRequest;
      const template = await replyTemplateService.createTemplate(data);
      res.status(201).json(template);
    } catch (error) {
      logger.error('Create template failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getTemplates(req: Request, res: Response) {
    try {
      const category = req.query.category as ComplaintCategory;
      const templates = await replyTemplateService.getTemplates(category);
      res.json(templates);
    } catch (error) {
      logger.error('Get templates failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getTemplateById(req: Request, res: Response) {
    try {
      const template = await replyTemplateService.getTemplateById(req.params.id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      logger.error('Get template failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const template = await replyTemplateService.updateTemplate(req.params.id, req.body);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      logger.error('Update template failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      await replyTemplateService.deleteTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Delete template failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const template = await replyTemplateService.toggleStatus(req.params.id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      logger.error('Toggle status failed:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export const replyTemplateController = new ReplyTemplateController();