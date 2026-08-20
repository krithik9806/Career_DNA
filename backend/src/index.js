import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import resumeRoutes from './routes/resume.js';
import githubRoutes from './routes/github.js';
import skillgraphRoutes from './routes/skillgraph.js';
import roadmapRoutes from './routes/roadmap.js';
import mentorRoutes from './routes/mentor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Career DNA API Service Active' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/skillgraph', skillgraphRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/mentor', mentorRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`[CAREER DNA BACKEND] Server listening on port ${PORT}`);
});
