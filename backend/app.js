const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('./config/passport');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
// Express 5 compatible mongo sanitization
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') mongoSanitize.sanitize(req.body);
  if (req.params && typeof req.params === 'object') mongoSanitize.sanitize(req.params);
  next();
});
app.use(passport.initialize());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting - generous threshold for development & active navigation
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 1000 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Basic health check and root welcome routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Placement Preparation Portal Backend API is live!',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Placement Preparation Portal API is running!',
    timestamp: new Date().toISOString()
  });
});

// Mount routers
const authRoutes = require('./routes/auth.routes');
const questionRoutes = require('./routes/question.routes');
const aiRoutes = require('./routes/ai.routes');
const userRoutes = require('./routes/user.routes');
const codingProblemRoutes = require('./routes/codingProblem.routes');
const testRoutes = require('./routes/test.routes');
const resultRoutes = require('./routes/result.routes');
const resumeRoutes = require('./routes/resume.routes');
const companyRoutes = require('./routes/company.routes');
const notificationRoutes = require('./routes/notification.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const bookmarkRoutes = require('./routes/bookmark.routes');
const aptitudeRoutes = require('./routes/aptitude.routes');
const reasoningRoutes = require('./routes/reasoning.routes');
const adminReasoningRoutes = require('./routes/adminReasoning.routes');
const englishRoutes = require('./routes/english.routes');
const adminEnglishRoutes = require('./routes/adminEnglish.routes');
const announcementRoutes = require('./routes/announcement.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/reasoning', adminReasoningRoutes);
app.use('/api/admin/english', adminEnglishRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coding', codingProblemRoutes);
app.use('/api/coding-problems', codingProblemRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/reasoning', reasoningRoutes);
app.use('/api/english', englishRoutes);
app.use('/api/announcements', announcementRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

module.exports = app;
