function validateRequest(schema = {}) {
  return (req, res, next) => {
    const fields = schema.fields || {};
    const errors = [];

    Object.entries(fields).forEach(([field, rules]) => {
      const value = req.body?.[field];
      const required = Boolean(rules.required);
      const type = rules.type || 'string';

      if (required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        return;
      }

      if (value === undefined || value === null || value === '') {
        return;
      }

      if (type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }

      if (type === 'number' && Number.isNaN(Number(value))) {
        errors.push(`${field} must be a number`);
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters long`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
}

module.exports = {
  validateRequest,
};
