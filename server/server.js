require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const experimentRoutes = require('./routes/experimentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

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

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`[ThermoTwin Server] Running at http://localhost:${PORT}`);
  console.log(`[ThermoTwin Server] Healthcheck: http://localhost:${PORT}/api/healthcheck`);
});

module.exports = { app, server };
