import logger from '@/utils/logger';
import ReplyTemplateModel from '@/models/ReplyTemplate';
import { ComplaintCategory, ReplyTemplateRequest } from '@shared/types';

interface ReplyTemplateResponse {
  _id: string;
  category: ComplaintCategory;
  keywords: string[];
  template: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toTemplateResponse(doc: any): ReplyTemplateResponse {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    _id: obj._id?.toString() || ''
  };
}

export class ReplyTemplateService {
  async createTemplate(data: ReplyTemplateRequest): Promise<ReplyTemplateResponse> {
    const template = await ReplyTemplateModel.create(data);
    logger.info(`Reply template created: ${template._id}`);
    return toTemplateResponse(template);
  }

  async getTemplates(category?: ComplaintCategory): Promise<ReplyTemplateResponse[]> {
    const query = category ? { category } : {};
    const templates = await ReplyTemplateModel.find(query).sort({ priority: -1 });
    return templates.map(toTemplateResponse);
  }

  async getTemplateById(id: string): Promise<ReplyTemplateResponse | null> {
    const template = await ReplyTemplateModel.findById(id);
    return template ? toTemplateResponse(template) : null;
  }

  async updateTemplate(id: string, data: Partial<ReplyTemplateRequest>): Promise<ReplyTemplateResponse | null> {
    const template = await ReplyTemplateModel.findByIdAndUpdate(id, data, { new: true });
    return template ? toTemplateResponse(template) : null;
  }

  async deleteTemplate(id: string): Promise<void> {
    await ReplyTemplateModel.findByIdAndDelete(id);
    logger.info(`Reply template deleted: ${id}`);
  }

  async toggleStatus(id: string): Promise<ReplyTemplateResponse | null> {
    const template = await ReplyTemplateModel.findById(id);
    if (!template) return null;

    template.isActive = !template.isActive;
    const saved = await template.save();
    return toTemplateResponse(saved);
  }
}

export const replyTemplateService = new ReplyTemplateService();