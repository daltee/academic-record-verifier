// Import required packages
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import transcript routes
const transcriptRoutes = require('./routes/transcriptRoutes');

// Create Express application
const app = express();

// Security middleware
app.use(helmet());

// Enable cross-origin requests
app.use(cors());

// Log incoming HTTP requests
app.use(morgan('dev'));

// Parse incoming JSON data
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Transcript Verification API is running'
    });
});

// Register transcript routes
app.use('/api/transcripts', transcriptRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Export the application
module.exports = app;