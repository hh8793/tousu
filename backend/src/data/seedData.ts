import mongoose from 'mongoose';
import UserModel from '@/models/User';
import ReplyTemplateModel from '@/models/ReplyTemplate';
import { UserRole, ComplaintCategory } from '@shared/types';
import bcrypt from 'bcryptjs';

export const seedData = async () => {
  const adminExists = await UserModel.findOne({ username: 'admin' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await UserModel.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      phone: '13800138000',
      role: UserRole.ADMIN
    });
    console.log('Admin user created');
  }

  const operatorExists = await UserModel.findOne({ username: 'operator' });
  if (!operatorExists) {
    const hashedPassword = await bcrypt.hash('operator123', 10);
    await UserModel.create({
      username: 'operator',
      password: hashedPassword,
      email: 'operator@example.com',
      phone: '13800138001',
      role: UserRole.OPERATOR
    });
    console.log('Operator user created');
  }

  const templates = [
    {
      category: ComplaintCategory.NOISE_POLLUTION,
      keywords: ['噪音', '扰民', '吵闹'],
      template: '尊敬的市民，感谢您的投诉。关于【{{category}}】问题，我们已记录您的反馈，相关部门将尽快前往核实处理。{{date}}',
      priority: 10,
      isActive: true
    },
    {
      category: ComplaintCategory.ENVIRONMENTAL_POLLUTION,
      keywords: ['污染', '污水', '异味'],
      template: '感谢您对环境问题的关注。我们已收到您关于【{{category}}】的投诉，环保部门将在24小时内前往调查处理。{{date}}',
      priority: 10,
      isActive: true
    },
    {
      category: ComplaintCategory.TRAFFIC_CONGESTION,
      keywords: ['拥堵', '红绿灯', '事故'],
      template: '感谢您的反馈。关于【{{category}}】问题，交通管理部门已收到您的投诉，将尽快优化相关路段的交通疏导。{{date}}',
      priority: 8,
      isActive: true
    },
    {
      category: ComplaintCategory.PUBLIC_FACILITY_DAMAGE,
      keywords: ['损坏', '路灯', '井盖'],
      template: '感谢您的报告。关于【{{category}}】问题，我们已通知维修部门尽快前往修复。{{date}}',
      priority: 9,
      isActive: true
    },
    {
      category: ComplaintCategory.GARBAGE_DISPOSAL,
      keywords: ['垃圾', '清运', '堆积'],
      template: '感谢您的反馈。我们已安排环卫部门前往【{{location}}】清理垃圾，请您耐心等待。{{date}}',
      priority: 8,
      isActive: true
    },
    {
      category: ComplaintCategory.CONSTRUCTION_NOISE,
      keywords: ['施工', '工地', '夜间'],
      template: '感谢您的投诉。关于【{{category}}】问题，我们已联系施工单位要求遵守施工时间规定，减少对周边居民的影响。{{date}}',
      priority: 10,
      isActive: true
    },
    {
      category: ComplaintCategory.PARKING_PROBLEM,
      keywords: ['停车', '占道', '车位'],
      template: '感谢您的反馈。关于【{{category}}】问题，城管部门将加强巡查，规范停车秩序。{{date}}',
      priority: 7,
      isActive: true
    },
    {
      category: ComplaintCategory.NEIGHBOR_DISPUTE,
      keywords: ['邻居', '纠纷', '扰民'],
      template: '感谢您的投诉。关于【{{category}}】问题，社区工作人员将介入协调处理，如有需要可联系派出所。{{date}}',
      priority: 6,
      isActive: true
    },
    {
      category: ComplaintCategory.MARKET_ORDER,
      keywords: ['市场', '摊位', '秩序'],
      template: '感谢您的反馈。关于【{{category}}】问题，市场管理部门将加强管理，维护良好的市场秩序。{{date}}',
      priority: 5,
      isActive: true
    },
    {
      category: ComplaintCategory.STREET_VENDING,
      keywords: ['摆摊', '商贩', '占道'],
      template: '感谢您的投诉。关于【{{category}}】问题，城管部门将加强整治，规范经营行为。{{date}}',
      priority: 7,
      isActive: true
    },
    {
      category: ComplaintCategory.OTHER,
      keywords: [],
      template: '感谢您的投诉。我们已收到您的反馈，将尽快安排相关部门处理。如有进展将及时通知您。{{date}}',
      priority: 0,
      isActive: true
    }
  ];

  for (const template of templates) {
    const existing = await ReplyTemplateModel.findOne({
      category: template.category,
      template: template.template
    });
    if (!existing) {
      await ReplyTemplateModel.create(template);
    }
  }
  console.log('Reply templates seeded');
};