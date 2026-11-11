const mongoose = require('mongoose');
const { generateVerificationCode, generateSignature, hashValue } = require('../utils/signature');

const transcriptSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    program: {
      type: String,
      required: true,
      trim: true,
    },
    issuingAuthority: {
      type: String,
      default: 'Academic Registrar',
      trim: true,
    },
    transcriptType: {
      type: String,
      default: 'Official Transcript',
      trim: true,
    },
    verificationCode: {
      type: String,
      default: function () {
        return generateVerificationCode(this.registrationNumber);
      },
      trim: true,
    },
    transcriptHash: {
      type: String,
      default: function () {
        return hashValue(JSON.stringify({
          registrationNumber: this.registrationNumber,
          studentName: this.studentName,
          program: this.program,
          issuingAuthority: this.issuingAuthority,
          transcriptType: this.transcriptType,
        }));
      },
    },
    signature: {
      type: String,
      default: function () {
        return generateSignature({
          registrationNumber: this.registrationNumber,
          studentName: this.studentName,
          program: this.program,
          issuingAuthority: this.issuingAuthority,
          transcriptType: this.transcriptType,
          verificationCode: this.verificationCode,
        });
      },
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Transcript = mongoose.models.Transcript || mongoose.model('Transcript', transcriptSchema);

module.exports = Transcript;
