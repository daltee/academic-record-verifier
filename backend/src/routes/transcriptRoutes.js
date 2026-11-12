/**
 * transcriptRoutes.js
 * Routes for transcript issue, verify and retrieve
 */

const express = require('express');
const {
  issueTranscript,
  verifyTranscript,
  getTranscriptById
} = require('../controllers/transcriptController');

const router = express.Router();

// Issue a new transcript
router.post('/issue', issueTranscript);

// Verify transcript authenticity (public)
router.post('/verify', verifyTranscript);

// Retrieve a transcript by ID
router.get('/:id', getTranscriptById);

module.exports = router;
