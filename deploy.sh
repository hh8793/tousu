#!/bin/bash
echo "=== 城市投诉自动回复系统部署脚本 ==="
echo ""

if [ -z "$GITHUB_REPO_URL" ]; then
  echo "请设置环境变量 GITHUB_REPO_URL"
  exit 1
fi

echo "1. 构建前端项目..."
cd frontend
npm install
npm run build
cd ..

echo ""
echo "2. 构建后端项目..."
cd backend
npm install
npm run build
cd ..

echo ""
echo "3. 推送代码到GitHub..."
git add .
git commit -m "Deploy: Build and deploy latest changes"
git push origin main

echo ""
echo "=== 部署完成！ ==="
echo "请在Render平台连接GitHub仓库完成部署"
echo "环境变量配置："
echo "  - NODE_ENV=production"
echo "  - PORT=10000"
echo "  - MONGODB_URI=<MongoDB连接字符串>"
echo "  - JWT_SECRET=<安全密钥>"