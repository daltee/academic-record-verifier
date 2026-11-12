/**
 * Transcript.js
 * Defines the structure of a transcript document in MongoDB
 */

const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      trim: true,
      uppercase: true
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    program: {
      type: String,
      required: [true, 'Program is required'],
      trim: true
    },
    yearOfStudy: {
      type: Number,
      required: [true, 'Year of study is required']
    },
    verificationHash: {
      type: String,
      required: true,
      unique: true
    },
    gpa: {
      type: Number
    },
    issuedBy: {
      type: String,
      default: 'Academic Registrar'
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    revokedAt: {
      type: Date
    },
    revokedReason: {
      type: String
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

// Speeds up verification lookups
transcriptSchema.index({ registrationNumber: 1, verificationHash: 1 });

module.exports = mongoose.model('Transcript', transcriptSchema);
