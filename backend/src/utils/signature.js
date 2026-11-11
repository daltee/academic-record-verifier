const crypto = require('crypto');

function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value, Object.keys(value).sort());
  return String(value);
}

function hashValue(value) {
  const text = normalizeValue(value);
  return crypto.createHash('sha256').update(text).digest('hex');
}

function generateSignature(payload, secret = process.env.SIGNATURE_SECRET || 'academic-transcript-secret') {
  const source = typeof payload === 'string'
    ? payload
    : JSON.stringify(payload, Object.keys(payload || {}).sort());
  return crypto.createHmac('sha256', secret).update(source).digest('hex');
}

function verifySignature(payload, signature, secret = process.env.SIGNATURE_SECRET || 'academic-transcript-secret') {
  const expected = generateSignature(payload, secret);
  if (!signature || typeof signature !== 'string') return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch (error) {
    return false;
  }
}

function generateVerificationCode(registrationNumber) {
  return crypto.createHash('sha256')
    .update(`${registrationNumber}-${Date.now()}`)
    .digest('hex')
    .slice(0, 12)
    .toUpperCase();
}

module.exports = {
  hashValue,
  generateSignature,
  verifySignature,
  generateVerificationCode,
};
