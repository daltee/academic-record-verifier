/**
 * transcriptController.js
 * Core business logic for issuing and verifying transcripts
 */

const crypto = require('crypto');
const Transcript = require('../models/Transcript');
const { generateVerificationHash } = require('../utils/signature');

// Compare two strings in constant time (helps prevent timing attacks)
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a || ''));
  const bufB = Buffer.from(String(b || ''));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * POST /api/transcripts/issue
 * Issue a new transcript and generate a verification hash
 */
const issueTranscript = async (req, res) => {
  try {
    const { registrationNumber, studentName, program, yearOfStudy, gpa } = req.body || {};

    if (!registrationNumber || !studentName || !program || yearOfStudy === undefined) {
      return res.status(400).json({
        success: false,
        message: 'registrationNumber, studentName, program and yearOfStudy are required'
      });
    }

    const verificationHash = generateVerificationHash({
      registrationNumber,
      studentName,
      program,
      yearOfStudy
    });

    const transcript = await Transcript.create({
      registrationNumber: String(registrationNumber).trim().toUpperCase(),
      studentName: String(studentName).trim(),
      program: String(program).trim(),
      yearOfStudy: Number(yearOfStudy),
      gpa: gpa !== undefined ? Number(gpa) : undefined,
      verificationHash,
      issuedBy: 'Academic Registrar'
    });

    return res.status(201).json({
      success: true,
      message: 'Transcript issued successfully',
      data: {
        id: transcript._id,
        registrationNumber: transcript.registrationNumber,
        studentName: transcript.studentName,
        program: transcript.program,
        yearOfStudy: transcript.yearOfStudy,
        verificationHash: transcript.verificationHash,
        issuedAt: transcript.createdAt
      }
    });
  } catch (error) {
    // Handle duplicate key error (unique verificationHash)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A transcript with this verification hash already exists. Please try again.'
      });
    }

    console.error('Issue transcript error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while issuing transcript'
    });
  }
};

/**
 * POST /api/transcripts/verify
 * Public endpoint – verify a transcript by registration number + hash
 */
const verifyTranscript = async (req, res) => {
  try {
    const body = req.body || {};
    // Accept both names for flexibility
    const registrationNumber = body.registrationNumber;
    const verificationHash = body.verificationHash || body.verificationCode;

    if (!registrationNumber || !verificationHash) {
      return res.status(400).json({
        success: false,
        message: 'registrationNumber and verificationHash (or verificationCode) are required'
      });
    }

    if (typeof registrationNumber !== 'string' || typeof verificationHash !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'registrationNumber and verificationHash must be strings'
      });
    }

    const transcript = await Transcript.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase()
    });

    // Same response for "not found" and "wrong hash" (avoids leaking which reg numbers exist)
    if (!transcript || !safeEqual(transcript.verificationHash, verificationHash.trim())) {
      return res.status(404).json({
        success: false,
        status: 'INVALID',
        message: 'No matching record found or the verification code is incorrect'
      });
    }

    if (transcript.isRevoked) {
      return res.status(400).json({
        success: false,
        status: 'REVOKED',
        message: 'This transcript has been revoked by the Academic Registrar',
        revokedAt: transcript.revokedAt,
        reason: transcript.revokedReason
      });
    }

    return res.status(200).json({
      success: true,
      status: 'AUTHENTIC',
      message: 'This transcript has been verified as genuine',
      data: {
        registrationNumber: transcript.registrationNumber,
        studentName: transcript.studentName,
        program: transcript.program,
        yearOfStudy: transcript.yearOfStudy,
        issuedAt: transcript.createdAt
      }
    });
  } catch (error) {
    console.error('Verify transcript error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

/**
 * GET /api/transcripts/:id
 * Retrieve a transcript by its MongoDB id (basic version)
 */
const getTranscriptById = async (req, res) => {
  try {
    const transcript = await Transcript.findById(req.params.id);

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: transcript
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving transcript'
    });
  }
};

module.exports = {
  issueTranscript,
  verifyTranscript,
  getTranscriptById
};
