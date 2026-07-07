FROM node:20-alpine

WORKDIR /app

COPY . .

RUN cd frontend && npm ci && npm run build

RUN cd backend && npm ci && npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "backend/dist/server.js"]