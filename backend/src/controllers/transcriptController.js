const crypto = require('crypto');
const Transcript = require('../models/Transcript');
const { generateVerificationCode, generateSignature, verifySignature, hashValue } = require('../utils/signature');

const transcriptStore = new Map();

function sanitizeTranscript(payload = {}) {
  return {
    id: String(payload.id || payload._id || crypto.randomUUID()),
    registrationNumber: String(payload.registrationNumber || '').trim(),
    studentName: String(payload.studentName || '').trim(),
    program: String(payload.program || '').trim(),
    issuingAuthority: String(payload.issuingAuthority || 'Academic Registrar').trim(),
    transcriptType: String(payload.transcriptType || 'Official Transcript').trim(),
    verificationCode: String(payload.verificationCode || '').trim(),
    issuedAt: payload.issuedAt || new Date().toISOString(),
  };
}

function buildTranscriptRecord(data = {}) {
  const transcript = sanitizeTranscript(data);
  const verificationCode = transcript.verificationCode || generateVerificationCode(transcript.registrationNumber);
  const signaturePayload = {
    id: transcript.id,
    registrationNumber: transcript.registrationNumber,
    studentName: transcript.studentName,
    program: transcript.program,
    issuingAuthority: transcript.issuingAuthority,
    transcriptType: transcript.transcriptType,
    verificationCode,
    issuedAt: new Date(transcript.issuedAt).toISOString(),
  };

  const transcriptHash = hashValue(JSON.stringify(signaturePayload));
  const signature = generateSignature(signaturePayload);

  return {
    ...transcript,
    verificationCode,
    transcriptHash,
    signature,
    issuedAt: new Date(signaturePayload.issuedAt).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function issueTranscript(req, res) {
  try {
    const { registrationNumber, studentName, program, issuingAuthority, transcriptType } = req.body || {};

    if (!registrationNumber || !studentName || !program) {
      return res.status(400).json({
        success: false,
        message: 'registrationNumber, studentName, and program are required',
      });
    }

    const transcriptData = buildTranscriptRecord({
      registrationNumber,
      studentName,
      program,
      issuingAuthority,
      transcriptType,
    });

    transcriptStore.set(transcriptData.id, transcriptData);

    if (Transcript && typeof Transcript.create === 'function') {
      try {
        const saved = await Transcript.create({
          registrationNumber: transcriptData.registrationNumber,
          studentName: transcriptData.studentName,
          program: transcriptData.program,
          issuingAuthority: transcriptData.issuingAuthority,
          transcriptType: transcriptData.transcriptType,
          verificationCode: transcriptData.verificationCode,
          transcriptHash: transcriptData.transcriptHash,
          signature: transcriptData.signature,
          issuedAt: transcriptData.issuedAt,
        });

        return res.status(201).json({
          success: true,
          message: 'Transcript issued successfully',
          transcript: saved.toObject ? saved.toObject() : saved,
        });
      } catch (dbError) {
        console.warn('MongoDB save failed, using in-memory store:', dbError.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Transcript issued successfully',
      transcript: transcriptData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to issue transcript',
      error: error.message,
    });
  }
}

async function getTranscriptById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Transcript ID is required',
      });
    }

    const transcript = transcriptStore.get(id) || null;

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found',
      });
    }

    return res.status(200).json({
      success: true,
      transcript,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transcript',
      error: error.message,
    });
  }
}

async function verifyTranscript(req, res) {
  try {
    const body = req.body || {};
    const registrationNumber = String(body.registrationNumber || req.params.registrationNumber || '').trim();
    const verificationCode = String(body.verificationCode || req.params.verificationCode || '').trim();

    if (!registrationNumber || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'registrationNumber and verificationCode are required',
      });
    }

    const transcript = Array.from(transcriptStore.values()).find((item) => {
      return item.registrationNumber === registrationNumber && item.verificationCode === verificationCode;
    });

    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'No matching transcript record found',
      });
    }

    const expectedSignature = generateSignature({
      id: transcript.id,
      registrationNumber: transcript.registrationNumber,
      studentName: transcript.studentName,
      program: transcript.program,
      issuingAuthority: transcript.issuingAuthority,
      transcriptType: transcript.transcriptType,
      verificationCode: transcript.verificationCode,
      issuedAt: transcript.issuedAt,
    });

    const isAuthentic = transcript.signature === expectedSignature
      || verifySignature({
        id: transcript.id,
        registrationNumber: transcript.registrationNumber,
        studentName: transcript.studentName,
        program: transcript.program,
        issuingAuthority: transcript.issuingAuthority,
        transcriptType: transcript.transcriptType,
        verificationCode: transcript.verificationCode,
        issuedAt: transcript.issuedAt,
      }, transcript.signature);

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Transcript signature is invalid',
      });
    }

    return res.status(200).json({
      success: true,
      status: 'Authentic',
      message: 'This transcript has been verified as genuine and issued by the Academic Registrar.',
      transcript: {
        id: transcript.id,
        registrationNumber: transcript.registrationNumber,
        studentName: transcript.studentName,
        program: transcript.program,
        issuingAuthority: transcript.issuingAuthority,
        transcriptType: transcript.transcriptType,
        verificationCode: transcript.verificationCode,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify transcript',
      error: error.message,
    });
  }
}

module.exports = {
  issueTranscript,
  getTranscriptById,
  verifyTranscript,
};
