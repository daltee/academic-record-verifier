/**
 * transcriptRoutes.js
 * Routes for transcript issue, verify, retrieve and revoke
 */

const express = require('express');
const {
  issueTranscript,
  verifyTranscript,
  getTranscriptById,
  revokeTranscript
} = require('../controllers/transcriptController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public – anyone can verify a transcript
router.post('/verify', verifyTranscript);

// Protected – only staff with valid JWT can issue or revoke
router.post('/issue', protect, issueTranscript);
router.patch('/revoke/:id', protect, revokeTranscript);

// Retrieve by ID (public for simplicity in this prototype)
router.get('/:id', getTranscriptById);

module.exports = router;
