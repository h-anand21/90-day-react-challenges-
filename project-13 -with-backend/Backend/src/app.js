import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import tripRoutes from './routes/trip.routes.js';
import itineraryRoutes from './routes/itinerary.routes.js';
import commentRoutes from './routes/comment.routes.js';
import checklistRoutes from './routes/checklist.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// Trust proxy for deployed environments (Render, Heroku, etc.)
app.set('trust proxy', 1);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

const isDev = process.env.NODE_ENV !== 'production';

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDev ? 100000 : 150, // 100,000 requests in dev (unlimited), 150 requests in production (secure)
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  }),
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ success: true, message: 'TripSync API v1' }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', itineraryRoutes);
app.use('/api', commentRoutes);
app.use('/api', checklistRoutes);
app.use('/api', expenseRoutes);
app.use('/api', reservationRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
