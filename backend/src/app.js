/**
 * app.js
 * Express application setup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const transcriptRoutes = require('./routes/transcriptRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Transcript Verification API is running',
    version: '1.0.0',
    group: 'Group C - SWE2106'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transcripts', transcriptRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
