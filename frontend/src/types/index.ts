export enum ComplaintCategory {
  NOISE_POLLUTION = 'noise_pollution',
  ENVIRONMENTAL_POLLUTION = 'environmental_pollution',
  TRAFFIC_CONGESTION = 'traffic_congestion',
  PUBLIC_FACILITY_DAMAGE = 'public_facility_damage',
  GARBAGE_DISPOSAL = 'garbage_disposal',
  CONSTRUCTION_NOISE = 'construction_noise',
  PARKING_PROBLEM = 'parking_problem',
  NEIGHBOR_DISPUTE = 'neighbor_dispute',
  MARKET_ORDER = 'market_order',
  STREET_VENDING = 'street_vending',
  OTHER = 'other'
}

export enum ComplaintStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  AUTO_REPLIED = 'auto_replied',
  MANUAL_PROCESSING = 'manual_processing',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum UserRole {
  CITIZEN = 'citizen',
  OPERATOR = 'operator',
  ADMIN = 'admin'
}

export interface Complaint {
  _id?: string;
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
  replies: Reply[];
  satisfaction?: number;
}

export interface AnalysisResult {
  category: ComplaintCategory;
  confidence: number;
  intent: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
}

export interface Reply {
  _id?: string;
  content: string;
  type: 'auto' | 'manual';
  createdAt: Date;
  operatorId?: string;
}

export interface ReplyTemplate {
  _id?: string;
  category: ComplaintCategory;
  keywords: string[];
  template: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Statistics {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  autoReplyRate: number;
  averageResponseTime: number;
  categoryDistribution: { category: ComplaintCategory; count: number }[];
  dailyTrend: { date: string; count: number }[];
  satisfactionRate: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface CreateComplaintRequest {
  title: string;
  content: string;
  images?: string[];
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

export interface UpdateComplaintStatusRequest {
  status: ComplaintStatus;
  operatorId?: string;
}

export interface ReplyTemplateRequest {
  category: ComplaintCategory;
  keywords: string[];
  template: string;
  priority: number;
  isActive: boolean;
}