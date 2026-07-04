import mongoose, { Schema, Document } from 'mongoose';
import { ComplaintCategory } from '@shared/types';

interface ReplyTemplateDocument extends Document {
  category: ComplaintCategory;
  keywords: string[];
  template: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReplyTemplateSchema = new Schema<ReplyTemplateDocument>({
  category: { type: String, enum: Object.values(ComplaintCategory), required: true },
  keywords: { type: [String], default: [] },
  template: { type: String, required: true },
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ReplyTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ReplyTemplateSchema.index({ category: 1, priority: -1 });

export default mongoose.model<ReplyTemplateDocument>('ReplyTemplate', ReplyTemplateSchema);