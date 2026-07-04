import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { ComplaintCategory, ComplaintStatus } from '@shared/types';

interface Reply {
  content: string;
  type: 'auto' | 'manual';
  createdAt: Date;
  operatorId?: ObjectId;
}

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

interface AnalysisResult {
  category: ComplaintCategory;
  confidence: number;
  intent: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
}

interface ComplaintDocument extends Document {
  userId: ObjectId;
  title: string;
  content: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high';
  images: string[];
  location?: Location;
  createdAt: Date;
  updatedAt: Date;
  analysisResult?: AnalysisResult;
  replies: Reply[];
  satisfaction?: number;
}

const ReplySchema = new Schema({
  content: { type: String, required: true },
  type: { type: String, enum: ['auto', 'manual'], required: true },
  createdAt: { type: Date, default: Date.now },
  operatorId: { type: Schema.Types.ObjectId, ref: 'User' }
});

const LocationSchema = new Schema({
  address: { type: String },
  latitude: { type: Number },
  longitude: { type: Number }
});

const AnalysisResultSchema = new Schema({
  category: { type: String, enum: Object.values(ComplaintCategory) },
  confidence: { type: Number },
  intent: { type: String },
  keywords: { type: [String] },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
  urgency: { type: String, enum: ['low', 'medium', 'high'] }
});

const ComplaintSchema = new Schema<ComplaintDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: Object.values(ComplaintCategory), default: ComplaintCategory.OTHER },
  status: { type: String, enum: Object.values(ComplaintStatus), default: ComplaintStatus.PENDING },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  images: { type: [String], default: [] },
  location: { type: LocationSchema },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  analysisResult: { type: AnalysisResultSchema },
  replies: { type: [ReplySchema], default: [] },
  satisfaction: { type: Number, min: 0, max: 5 }
});

ComplaintSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ComplaintSchema.index({ userId: 1, createdAt: -1 });
ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ category: 1 });

export default mongoose.model<ComplaintDocument>('Complaint', ComplaintSchema);