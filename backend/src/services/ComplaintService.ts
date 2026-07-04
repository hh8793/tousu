import logger from '@/utils/logger';
import ComplaintModel from '@/models/Complaint';
import ReplyTemplateModel from '@/models/ReplyTemplate';
import { openClawService } from './OpenClawService';
import { ObjectId, Types } from 'mongoose';
import {
  ComplaintCategory,
  ComplaintStatus,
  CreateComplaintRequest,
  UpdateComplaintStatusRequest,
  AnalysisResult
} from '@shared/types';

interface Reply {
  content: string;
  type: 'auto' | 'manual';
  createdAt: Date;
  operatorId?: any;
}

interface ComplaintDocument {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  content: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high';
  images: string[];
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
  analysisResult?: AnalysisResult;
  replies: Reply[];
  satisfaction?: number;
}

interface ComplaintResponse {
  _id: string;
  userId: string;
  title: string;
  content: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high';
  images: string[];
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
  analysisResult?: AnalysisResult;
  replies: {
    _id?: string;
    content: string;
    type: 'auto' | 'manual';
    createdAt: Date;
    operatorId?: string;
  }[];
  satisfaction?: number;
}

function toComplaintResponse(doc: any): ComplaintResponse {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    _id: obj._id?.toString() || '',
    userId: obj.userId?.toString() || obj.userId || '',
    replies: obj.replies?.map((r: any) => ({
      ...r,
      _id: r._id?.toString(),
      operatorId: r.operatorId?.toString()
    })) || []
  };
}

export class ComplaintService {
  async createComplaint(userId: string, data: CreateComplaintRequest): Promise<ComplaintResponse> {
    const complaint = await ComplaintModel.create({
      userId,
      title: data.title,
      content: data.content,
      images: data.images || [],
      location: data.location,
      status: ComplaintStatus.PENDING
    });

    logger.info(`Complaint created: ${complaint._id}`);
    return toComplaintResponse(complaint);
  }

  async analyzeAndReply(complaintId: string): Promise<ComplaintResponse> {
    const complaint = await ComplaintModel.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found');
    }

    complaint.status = ComplaintStatus.ANALYZING;
    await complaint.save();

    try {
      const analysisResult = await openClawService.analyzeComplaint(
        complaint.content,
        complaint.title
      );

      complaint.analysisResult = analysisResult;
      complaint.category = analysisResult.category;
      complaint.priority = analysisResult.urgency;

      const replyTemplate = await this.findMatchingTemplate(
        analysisResult.category,
        analysisResult.keywords
      );

      if (replyTemplate) {
        const replyContent = this.replacePlaceholders(
          replyTemplate.template,
          complaint,
          analysisResult
        );

        complaint.replies.push({
          content: replyContent,
          type: 'auto',
          createdAt: new Date()
        });

        complaint.status = ComplaintStatus.AUTO_REPLIED;
        logger.info(`Auto reply generated for complaint: ${complaintId}`);
      } else {
        complaint.status = ComplaintStatus.MANUAL_PROCESSING;
        logger.info(`No matching template found, requires manual processing: ${complaintId}`);
      }

      await complaint.save();
      return toComplaintResponse(complaint);
    } catch (error) {
      logger.error(`Failed to analyze complaint ${complaintId}:`, error);
      complaint.status = ComplaintStatus.MANUAL_PROCESSING;
      await complaint.save();
      return toComplaintResponse(complaint);
    }
  }

  async findMatchingTemplate(category: ComplaintCategory, keywords: string[]): Promise<any | null> {
    const templates = await ReplyTemplateModel.find({
      category,
      isActive: true
    }).sort({ priority: -1 });

    for (const template of templates) {
      if (template.keywords.length === 0) {
        return template;
      }

      if (keywords.some(keyword => 
        template.keywords.some(templateKeyword => 
          keyword.includes(templateKeyword) || templateKeyword.includes(keyword)
        )
      )) {
        return template;
      }
    }

    return null;
  }

  private replacePlaceholders(
    template: string,
    complaint: any,
    analysis: AnalysisResult
  ): string {
    let result = template;
    result = result.replace(/{{title}}/g, complaint.title);
    result = result.replace(/{{content}}/g, complaint.content);
    result = result.replace(/{{category}}/g, this.getCategoryLabel(analysis.category));
    result = result.replace(/{{location}}/g, complaint.location?.address || '未知位置');
    result = result.replace(/{{urgency}}/g, this.getUrgencyLabel(analysis.urgency));
    result = result.replace(/{{date}}/g, new Date().toLocaleDateString('zh-CN'));
    return result;
  }

  private getCategoryLabel(category: ComplaintCategory): string {
    const labels: Record<ComplaintCategory, string> = {
      [ComplaintCategory.NOISE_POLLUTION]: '噪音污染',
      [ComplaintCategory.ENVIRONMENTAL_POLLUTION]: '环境污染',
      [ComplaintCategory.TRAFFIC_CONGESTION]: '交通拥堵',
      [ComplaintCategory.PUBLIC_FACILITY_DAMAGE]: '公共设施损坏',
      [ComplaintCategory.GARBAGE_DISPOSAL]: '垃圾处理',
      [ComplaintCategory.CONSTRUCTION_NOISE]: '施工噪音',
      [ComplaintCategory.PARKING_PROBLEM]: '停车问题',
      [ComplaintCategory.NEIGHBOR_DISPUTE]: '邻里纠纷',
      [ComplaintCategory.MARKET_ORDER]: '市场秩序',
      [ComplaintCategory.STREET_VENDING]: '占道经营',
      [ComplaintCategory.OTHER]: '其他'
    };
    return labels[category];
  }

  private getUrgencyLabel(urgency: string): string {
    const labels: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高'
    };
    return labels[urgency] || urgency;
  }

  async getComplaints(query: {
    userId?: string;
    status?: ComplaintStatus;
    category?: ComplaintCategory;
    page?: number;
    limit?: number;
  }): Promise<{ complaints: ComplaintResponse[]; total: number }> {
    const { userId, status, category, page = 1, limit = 20 } = query;
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [complaints, total] = await Promise.all([
      ComplaintModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'username'),
      ComplaintModel.countDocuments(filter)
    ]);

    return { complaints: complaints.map(toComplaintResponse), total };
  }

  async getComplaintById(id: string): Promise<ComplaintResponse | null> {
    const complaint = await ComplaintModel.findById(id).populate('userId', 'username');
    return complaint ? toComplaintResponse(complaint) : null;
  }

  async updateStatus(id: string, data: UpdateComplaintStatusRequest): Promise<ComplaintResponse | null> {
    const complaint = await ComplaintModel.findByIdAndUpdate(
      id,
      { status: data.status, updatedAt: new Date() },
      { new: true }
    );
    return complaint ? toComplaintResponse(complaint) : null;
  }

  async addManualReply(
    id: string,
    content: string,
    operatorId: string
  ): Promise<ComplaintResponse | null> {
    const complaint = await ComplaintModel.findById(id);
    if (!complaint) return null;

    complaint.replies.push({
      content,
      type: 'manual',
      operatorId: operatorId as any,
      createdAt: new Date()
    });

    complaint.status = ComplaintStatus.RESOLVED;
    const saved = await complaint.save();
    return toComplaintResponse(saved);
  }

  async submitSatisfaction(id: string, rating: number): Promise<ComplaintResponse | null> {
    const complaint = await ComplaintModel.findByIdAndUpdate(
      id,
      { satisfaction: rating, status: ComplaintStatus.CLOSED, updatedAt: new Date() },
      { new: true }
    );
    return complaint ? toComplaintResponse(complaint) : null;
  }

  async deleteComplaint(id: string): Promise<void> {
    await ComplaintModel.findByIdAndDelete(id);
    logger.info(`Complaint deleted: ${id}`);
  }
}

export const complaintService = new ComplaintService();