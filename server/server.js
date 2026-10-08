require('dotenv').config();
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const experimentRoutes = require('./routes/experimentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API (compatible with src/api/healthcheck.js)
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ThermoTwin Virtual Lab Backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: 'MongoDB'
  });
});

// Connect lazily so serverless instances reuse a single MongoDB connection.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/experiments', experimentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
});

module.exports = { app };

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`[ThermoTwin Server] Running at http://localhost:${PORT}`);
    console.log(`[ThermoTwin Server] Healthcheck: http://localhost:${PORT}/api/healthcheck`);
  });
  module.exports.server = server;
}
