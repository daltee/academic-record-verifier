/**
 * transcriptController.js
 * Core business logic for issuing, verifying, listing and revoking transcripts
 */

const crypto = require('crypto');
const Transcript = require('../models/Transcript');
const { generateVerificationHash } = require('../utils/signature');

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a || ''));
  const bufB = Buffer.from(String(b || ''));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * GET /api/transcripts
 * List all transcripts for the registrar dashboard
 * Protected – requires staff JWT
 */
const listTranscripts = async (req, res) => {
  try {
    const transcripts = await Transcript.find()
      .sort({ createdAt: -1 })
      .select(
        'registrationNumber studentName program yearOfStudy gpa verificationHash isRevoked revokedAt revokedReason issuedBy createdAt'
      )
      .lean();

    return res.status(200).json({
      success: true,
      count: transcripts.length,
      data: transcripts
    });
  } catch (error) {
    console.error('List transcripts error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while listing transcripts'
    });
  }
};

/**
 * POST /api/transcripts/issue
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
      issuedBy: req.user?.name || 'Academic Registrar'
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
 */
const verifyTranscript = async (req, res) => {
  try {
    const body = req.body || {};
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

/**
 * PATCH /api/transcripts/revoke/:id
 */
const revokeTranscript = async (req, res) => {
  try {
    const { reason } = req.body || {};

    const transcript = await Transcript.findById(req.params.id);

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found'
      });
    }

    if (transcript.isRevoked) {
      return res.status(400).json({
        success: false,
        message: 'Transcript is already revoked'
      });
    }

    transcript.isRevoked = true;
    transcript.revokedAt = new Date();
    transcript.revokedReason = reason || 'Revoked by Academic Registrar';
    await transcript.save();

    return res.status(200).json({
      success: true,
      message: 'Transcript revoked successfully',
      data: {
        id: transcript._id,
        registrationNumber: transcript.registrationNumber,
        isRevoked: transcript.isRevoked,
        revokedAt: transcript.revokedAt,
        revokedReason: transcript.revokedReason
      }
    });
  } catch (error) {
    console.error('Revoke transcript error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while revoking transcript'
    });
  }
};

module.exports = {
  listTranscripts,
  issueTranscript,
  verifyTranscript,
  getTranscriptById,
  revokeTranscript
};
