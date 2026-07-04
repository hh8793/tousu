import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from '@/config';
import { connectDatabase } from '@/utils/database';
import logger from '@/utils/logger';
import routes from '@/routes';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { seedData } from '@/data/seedData';
import { upload } from '@/middleware/upload';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.post('/api/upload', upload.array('images', 5), (req: any, res) => {
  const files = req.files as Express.Multer.File[];
  const imageUrls = files.map(file => `/uploads/${file.filename}`);
  res.json({ images: imageUrls });
});

app.use('/api', routes);

if (config.environment === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.use(notFoundHandler);
}

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    await seedData();
    
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.environment}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();