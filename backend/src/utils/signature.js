

const crypto = require('crypto');

/**
Generate a unique verification hash from transcript data
 */
const generateVerificationHash = (data) => {
  const secret = process.env.SIGNATURE_SECRET || 'default_secret_change_me';

  // Combine key fields into a string
  const payload = [
    data.registrationNumber,
    data.studentName,
    data.program,
    data.yearOfStudy,
    Date.now() // adds uniqueness
  ].join('|');

  // Create HMAC hash
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Return a shorter, more user-friendly version (first 16 chars)
  // You can keep the full hash if preferred
  return hash.substring(0, 16).toUpperCase();
};

/**
 * Optional: Verify that a given hash matches the data
 * (Useful later if you want extra integrity checks)
 */
const verifyHash = (data, providedHash) => {
  // For the current simple approach we mainly look up the hash in the DB
  // This function can be expanded later
  return true;
};

module.exports = {
  generateVerificationHash,
  verifyHash
};
