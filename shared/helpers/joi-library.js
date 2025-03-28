const Joi = require('joi');

// RFC validator for both individuals and legal entities
const rfcValidator = Joi.string()
  .pattern(/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/)
  .custom((value, helpr) => {
    // Check for individual RFC (4 letters + 6 digits + 3 alphanumeric)
    const isPersonRFC = /^[A-Z&Ñ]{4}[0-9]{6}[A-Z0-9]{3}$/.test(value);
    
    // Check for business entity RFC (3 letters + 6 digits + 3 alphanumeric)
    const isBusinessRFC = /^[A-Z&Ñ]{3}[0-9]{6}[A-Z0-9]{3}$/.test(value);
    if (!isPersonRFC && !isBusinessRFC) {
      return helpr.error('string.rfcFormat');
    }
    
    // Additional validation could be added here:
    // - Verify the date portion (6 digits) is a valid date
    // - Check for prohibited combinations in the first letters
    // - Validate the homoclave (last 3 characters)
    
    return value;
  })
  .messages({
    'string.rfcFormat': 'Invalid RFC format. Must be 12 characters for business entities or 13 characters for individuals',
    'string.pattern.base':  i18n.__('invalid.fieldFormat', 'RFC' )    ,
  });

module.exports = {rfcValidator};