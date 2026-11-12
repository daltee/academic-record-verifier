function isEmptyValue(value) {
  return value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '');
}

function getFieldValue(req, field) {
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, field)) {
    return req.body[field];
  }

  if (req.query && Object.prototype.hasOwnProperty.call(req.query, field)) {
    return req.query[field];
  }

  if (req.params && Object.prototype.hasOwnProperty.call(req.params, field)) {
    return req.params[field];
  }

  return undefined;
}

function validateRequest(schema = {}) {
  return (req, res, next) => {
    const fields = schema.fields || schema || {};
    const errors = [];

    Object.entries(fields).forEach(([field, rules]) => {
      const value = getFieldValue(req, field);
      const config = rules && typeof rules === 'object' ? rules : {};
      const required = Boolean(config.required);
      const type = config.type || 'string';

      if (required && isEmptyValue(value)) {
        errors.push(`${field} is required`);
        return;
      }

      if (isEmptyValue(value)) {
        return;
      }

      if (type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }

      if (type === 'number') {
        const numericValue = Number(value);
        if (Number.isNaN(numericValue) || !Number.isFinite(numericValue)) {
          errors.push(`${field} must be a number`);
        }
      }

      if (type === 'boolean') {
        const allowed = value === true || value === false || value === 'true' || value === 'false';
        if (!allowed) {
          errors.push(`${field} must be a boolean`);
        }
      }

      if (type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      if (type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
        errors.push(`${field} must be an object`);
      }

      if (config.enum && Array.isArray(config.enum) && !config.enum.includes(value)) {
        errors.push(`${field} must be one of: ${config.enum.join(', ')}`);
      }

      if (config.minLength !== undefined && typeof value === 'string' && value.length < config.minLength) {
        errors.push(`${field} must be at least ${config.minLength} characters long`);
      }

      if (config.maxLength !== undefined && typeof value === 'string' && value.length > config.maxLength) {
        errors.push(`${field} must be at most ${config.maxLength} characters long`);
      }

      if (config.min !== undefined && ((typeof value === 'number' && value < config.min) || (typeof value === 'string' && Number(value) < config.min))) {
        errors.push(`${field} must be at least ${config.min}`);
      }

      if (config.max !== undefined && ((typeof value === 'number' && value > config.max) || (typeof value === 'string' && Number(value) > config.max))) {
        errors.push(`${field} must be at most ${config.max}`);
      }

      if (config.pattern && typeof value === 'string') {
        const regex = new RegExp(config.pattern);
        if (!regex.test(value)) {
          errors.push(`${field} is invalid`);
        }
      }

      if (config.email && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field} must be a valid email address`);
        }
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
