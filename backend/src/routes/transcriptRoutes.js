// Import Express
const express = require('express');

// Import transcript controller functions
const {
    issueTranscript,
    getTranscriptById,
    verifyTranscript
} = require('../controllers/transcriptController');

// Create router instance
const router = express.Router();

// Issue a new transcript
router.post('/', issueTranscript);

// Verify transcript authenticity
router.post('/verify', verifyTranscript);

// Retrieve a transcript by ID
router.get('/:id', getTranscriptById);

// Export routes
module.exports = router;