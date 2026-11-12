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
const { validateRequest } = require('../middleware/validate');

const router = express.Router();

// Validation schemas
const verifySchema = {
  fields: {
    registrationNumber: { required: true, type: 'string', minLength: 3 },
    verificationHash: { required: false, type: 'string' },
    verificationCode: { required: false, type: 'string' }
  }
};

const issueSchema = {
  fields: {
    registrationNumber: { required: true, type: 'string', minLength: 3 },
    studentName: { required: true, type: 'string', minLength: 2 },
    program: { required: true, type: 'string', minLength: 2 },
    yearOfStudy: { required: true, type: 'number', min: 1, max: 10 },
    gpa: { required: false, type: 'number', min: 0, max: 5 }
  }
};

// Public – anyone can verify a transcript
router.post(
  '/verify',
  validateRequest(verifySchema),
  verifyTranscript
);

// Protected – only staff with valid JWT can issue or revoke
router.post(
  '/issue',
  protect,
  validateRequest(issueSchema),
  issueTranscript
);

router.patch('/revoke/:id', protect, revokeTranscript);

// Retrieve by ID (public for simplicity in this prototype)
router.get('/:id', getTranscriptById);

module.exports = router;
