import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '@/config';
import logger from '@/utils/logger';
import { ComplaintCategory, AnalysisResult } from '@shared/types';

interface OpenClawAnalysisResponse {
  category: string;
  confidence: number;
  intent: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
}

const categoryMap: Record<string, ComplaintCategory> = {
  'noise': ComplaintCategory.NOISE_POLLUTION,
  'environmental': ComplaintCategory.ENVIRONMENTAL_POLLUTION,
  'traffic': ComplaintCategory.TRAFFIC_CONGESTION,
  'facility': ComplaintCategory.PUBLIC_FACILITY_DAMAGE,
  'garbage': ComplaintCategory.GARBAGE_DISPOSAL,
  'construction': ComplaintCategory.CONSTRUCTION_NOISE,
  'parking': ComplaintCategory.PARKING_PROBLEM,
  'neighbor': ComplaintCategory.NEIGHBOR_DISPUTE,
  'market': ComplaintCategory.MARKET_ORDER,
  'vending': ComplaintCategory.STREET_VENDING,
  'other': ComplaintCategory.OTHER
};

const mockAnalysisResults: OpenClawAnalysisResponse[] = [
  { category: 'noise', confidence: 0.92, intent: 'complaint', keywords: ['噪音', '扰民', '深夜'], sentiment: 'negative', urgency: 'high' },
  { category: 'environmental', confidence: 0.88, intent: 'complaint', keywords: ['污染', '垃圾', '异味'], sentiment: 'negative', urgency: 'medium' },
  { category: 'traffic', confidence: 0.91, intent: 'complaint', keywords: ['拥堵', '停车', '违章'], sentiment: 'negative', urgency: 'medium' },
  { category: 'facility', confidence: 0.85, intent: 'report', keywords: ['损坏', '路灯', '设施'], sentiment: 'neutral', urgency: 'low' },
  { category: 'garbage', confidence: 0.89, intent: 'complaint', keywords: ['垃圾', '清运', '堆积'], sentiment: 'negative', urgency: 'medium' },
  { category: 'construction', confidence: 0.93, intent: 'complaint', keywords: ['施工', '噪音', '夜间'], sentiment: 'negative', urgency: 'high' },
  { category: 'parking', confidence: 0.87, intent: 'complaint', keywords: ['停车', '占道', '车位'], sentiment: 'negative', urgency: 'low' },
  { category: 'neighbor', confidence: 0.86, intent: 'complaint', keywords: ['邻居', '纠纷', '扰民'], sentiment: 'negative', urgency: 'medium' },
  { category: 'market', confidence: 0.84, intent: 'report', keywords: ['市场', '秩序', '管理'], sentiment: 'neutral', urgency: 'low' },
  { category: 'vending', confidence: 0.82, intent: 'report', keywords: ['摆摊', '占道', '商贩'], sentiment: 'neutral', urgency: 'low' },
];

export class OpenClawService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.openClaw.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.openClaw.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: config.openClaw.timeout
    });
  }

  async analyzeComplaint(content: string, title: string): Promise<AnalysisResult> {
    const retryCount = config.openClaw.retryCount;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        if (config.environment === 'development') {
          return this.getMockAnalysis(content);
        }

        const response = await this.axiosInstance.post<OpenClawAnalysisResponse>(
          '/analyze',
          { text: `${title}\n${content}` }
        );

        return this.mapResponse(response.data);
      } catch (error) {
        lastError = error as Error;
        logger.warn(`OpenClaw analysis attempt ${attempt} failed:`, error);
        
        if (attempt < retryCount) {
          await this.delay(attempt * 500);
        }
      }
    }

    logger.error(`OpenClaw analysis failed after ${retryCount} attempts`, lastError);
    return this.getMockAnalysis(content);
  }

  private getMockAnalysis(content: string): AnalysisResult {
    const randomIndex = Math.floor(Math.random() * mockAnalysisResults.length);
    const result = mockAnalysisResults[randomIndex];
    
    const matchedCategory = this.detectCategoryFromContent(content);
    if (matchedCategory) {
      result.category = matchedCategory;
    }

    return this.mapResponse(result);
  }

  private detectCategoryFromContent(content: string): string | undefined {
    const categoryKeywords: Record<string, string[]> = {
      'noise': ['噪音', '吵闹', '喧哗', '分贝', '扰民'],
      'environmental': ['污染', '污水', '废气', '异味', '环保'],
      'traffic': ['堵车', '拥堵', '红绿灯', '交通事故', '违章'],
      'facility': ['路灯', '井盖', '垃圾桶', '公共设施', '损坏'],
      'garbage': ['垃圾', '清运', '分类', '堆积', '臭味'],
      'construction': ['施工', '工地', '打桩', '装修'],
      'parking': ['停车', '车位', '占道', '违停'],
      'neighbor': ['邻居', '楼上', '楼下', '争吵', '纠纷'],
      'market': ['市场', '摊位', '占道经营', '秩序'],
      'vending': ['摆摊', '商贩', '流动', '路边摊']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category;
      }
    }
    return undefined;
  }

  private mapResponse(response: OpenClawAnalysisResponse): AnalysisResult {
    return {
      category: categoryMap[response.category] || ComplaintCategory.OTHER,
      confidence: response.confidence,
      intent: response.intent,
      keywords: response.keywords,
      sentiment: response.sentiment,
      urgency: response.urgency
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const openClawService = new OpenClawService();