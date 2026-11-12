const crypto = require('crypto');
const Transcript = require('../models/Transcript');

// Compare two strings in constant time (prevents timing attacks)
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// POST /api/transcripts/verify  (Elvis Ssekajigo)
const verifyTranscript = async (req, res) => {
  try {
    const { registrationNumber, verificationCode } = req.body || {};

    // 1. Both fields must be present
    if (!registrationNumber || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'registrationNumber and verificationCode are required'
      });
    }

    // 2. Must be plain strings (blocks NoSQL injection like {"$ne": ""})
    if (typeof registrationNumber !== 'string' || typeof verificationCode !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'registrationNumber and verificationCode must be strings'
      });
    }

    // 3. Look up the record
    const transcript = await Transcript.findOne({
      registrationNumber: registrationNumber.trim()
    });

    // 4. Same response for "no record" and "wrong code",
    //    so nobody can probe which registration numbers exist
    if (!transcript || !safeEqual(transcript.verificationCode, verificationCode.trim())) {
      return res.status(404).json({
        success: false,
        status: 'Invalid',
        message: 'No matching record found or the verification code is incorrect'
      });
    }

    // 5. Authentic
    return res.status(200).json({
      success: true,
      status: 'Authentic',
      message: 'This transcript has been verified as genuine',
      transcript
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

module.exports = {
  // issueTranscript,      <- Ataho's
  // getTranscriptById,    <- whoever owns it
  verifyTranscript
};