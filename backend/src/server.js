require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const limiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { startEmailPolling } = require('./services/emailReceiver');

// Import routes
const rfpRoutes = require('./routes/rfpRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const proposalRoutes = require('./routes/proposalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AI RFP Management System API', status: 'running' });
});

app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  
  // Start email polling after server starts
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    console.log('📧 Email configuration found');
    // Start polling every 30 seconds
    setTimeout(() => {
      startEmailPolling(30000);
    }, 5000); // Wait 5 seconds before starting polling
  } else {
    console.warn('⚠️ Email configuration not found. Email polling disabled.');
  }
});

module.exports = app;
