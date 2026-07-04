import ComplaintModel from '@/models/Complaint';
import { Statistics, ComplaintCategory, ComplaintStatus } from '@shared/types';

export class StatisticsService {
  async getStatistics(): Promise<Statistics> {
    const [
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      autoRepliedCount,
      avgResponseTime,
      categoryDistribution,
      dailyTrend,
      avgSatisfaction
    ] = await Promise.all([
      ComplaintModel.countDocuments(),
      ComplaintModel.countDocuments({ status: ComplaintStatus.RESOLVED }),
      ComplaintModel.countDocuments({ status: { $in: [ComplaintStatus.PENDING, ComplaintStatus.ANALYZING] } }),
      ComplaintModel.countDocuments({ status: ComplaintStatus.AUTO_REPLIED }),
      this.calculateAverageResponseTime(),
      this.getCategoryDistribution(),
      this.getDailyTrend(),
      this.calculateAverageSatisfaction()
    ]);

    const autoReplyRate = totalComplaints > 0 ? (autoRepliedCount / totalComplaints) * 100 : 0;

    return {
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      autoReplyRate: Math.round(autoReplyRate * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      categoryDistribution,
      dailyTrend,
      satisfactionRate: Math.round((avgSatisfaction / 5) * 100 * 100) / 100
    };
  }

  private async calculateAverageResponseTime(): Promise<number> {
    const complaints = await ComplaintModel.find({
      status: { $in: [ComplaintStatus.AUTO_REPLIED, ComplaintStatus.RESOLVED] },
      replies: { $exists: true, $ne: [] }
    });

    if (complaints.length === 0) return 0;

    const totalMinutes = complaints.reduce((acc, complaint) => {
      if (!complaint.replies || complaint.replies.length === 0) return acc;
      
      const firstReplyTime = new Date(complaint.replies[0].createdAt).getTime();
      const submitTime = new Date(complaint.createdAt).getTime();
      return acc + (firstReplyTime - submitTime);
    }, 0);

    return (totalMinutes / complaints.length) / 60000;
  }

  private async getCategoryDistribution(): Promise<{ category: ComplaintCategory; count: number }[]> {
    const result = await ComplaintModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return result.map(item => ({
      category: item._id as ComplaintCategory,
      count: item.count
    }));
  }

  private async getDailyTrend(): Promise<{ date: string; count: number }[]> {
    const result = await ComplaintModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);

    return result.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      count: item.count
    }));
  }

  private async calculateAverageSatisfaction(): Promise<number> {
    const result = await ComplaintModel.aggregate([
      {
        $match: { satisfaction: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$satisfaction' }
        }
      }
    ]);

    return result.length > 0 ? result[0].avg : 0;
  }
}

export const statisticsService = new StatisticsService();