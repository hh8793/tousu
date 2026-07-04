# 城市投诉自动回复系统

## 项目简介

城市投诉自动回复系统是一个基于Web的智能投诉处理平台，与OpenClaw工具深度集成，实现投诉文本的智能语义分析、用户意图精准识别和上下文相关的自动响应内容生成。

## 技术栈

### 前端
- Vue 3 + TypeScript
- Element Plus (UI框架)
- Vue Router (路由管理)
- Pinia (状态管理)
- ECharts (数据可视化)
- Axios (HTTP请求)

### 后端
- Node.js + TypeScript
- Express (Web框架)
- MongoDB + Mongoose (数据库)
- JWT (身份认证)
- Winston (日志记录)

## 功能模块

1. **用户投诉提交界面** - 支持文本、图片等多种投诉内容提交方式，响应式设计适配移动端和桌面端
2. **投诉管理后台** - 提供投诉数据的查询、筛选、手动处理及状态跟踪功能
3. **自动回复配置模块** - 允许管理员设置不同投诉类型的回复规则、关键词匹配策略和响应模板
4. **数据统计分析功能** - 生成投诉类型分布、处理效率、用户满意度等关键指标的可视化报表

## 投诉类型

系统支持10种常见城市投诉类型的自动分类：
- 噪音污染
- 环境污染
- 交通拥堵
- 公共设施损坏
- 垃圾处理
- 施工噪音
- 停车问题
- 邻里纠纷
- 市场秩序
- 占道经营
- 其他

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- MongoDB >= 4.0.0

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 配置环境变量

复制并修改后端配置文件：
```bash
cd backend
cp .env.example .env
```

修改 `.env` 文件中的配置项：
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/complaint-management
JWT_SECRET=your-secret-key-here
OPENCLAW_API_URL=http://localhost:8080/api/v1
OPENCLAW_API_KEY=your-openclaw-api-key
```

### 启动服务

```bash
# 启动后端服务（开发模式）
cd backend
npm run dev

# 启动前端服务（开发模式）
cd frontend
npm run dev
```

### 初始化数据

系统启动后会自动创建初始管理员账户：
- 用户名: admin
- 密码: admin123

以及初始操作员账户：
- 用户名: operator
- 密码: operator123

## API接口

### 用户认证
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息

### 投诉管理
- `POST /api/complaints` - 提交投诉
- `GET /api/complaints` - 获取投诉列表
- `GET /api/complaints/:id` - 获取投诉详情
- `PUT /api/complaints/:id/status` - 更新投诉状态
- `POST /api/complaints/:id/reply` - 添加人工回复
- `POST /api/complaints/:id/satisfaction` - 提交满意度评价

### 回复模板
- `POST /api/reply-templates` - 创建回复模板
- `GET /api/reply-templates` - 获取模板列表
- `PUT /api/reply-templates/:id` - 更新模板
- `DELETE /api/reply-templates/:id` - 删除模板

### 统计分析
- `GET /api/statistics` - 获取统计数据

## 项目结构

```
.
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── controllers/        # 控制器
│   │   ├── services/           # 服务层
│   │   ├── models/             # 数据模型
│   │   ├── middleware/         # 中间件
│   │   ├── routes/             # 路由配置
│   │   ├── types/              # 类型定义
│   │   ├── utils/              # 工具函数
│   │   ├── config/             # 配置文件
│   │   ├── data/               # 初始数据
│   │   └── server.ts           # 入口文件
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/         # 公共组件
│   │   ├── pages/              # 页面组件
│   │   ├── services/           # API服务
│   │   ├── stores/             # Pinia状态管理
│   │   ├── types/              # 类型定义
│   │   ├── utils/              # 工具函数
│   │   ├── router/             # 路由配置
│   │   ├── App.vue             # 根组件
│   │   └── main.ts             # 入口文件
│   ├── package.json
│   └── vite.config.ts
├── shared/                     # 共享类型定义
│   └── types/
└── README.md
```

## OpenClaw集成

系统与OpenClaw API集成实现智能语义分析，主要功能包括：
- 投诉文本智能分类
- 用户意图识别
- 关键词提取
- 情感分析
- 紧急程度判断

配置项：
- `OPENCLAW_API_URL` - OpenClaw API地址
- `OPENCLAW_API_KEY` - API密钥
- `OPENCLAW_TIMEOUT` - 请求超时时间（毫秒）
- `OPENCLAW_RETRY_COUNT` - 重试次数

开发模式下系统使用Mock数据进行分析，生产环境需配置真实的OpenClaw API地址。

## 许可证

MIT License