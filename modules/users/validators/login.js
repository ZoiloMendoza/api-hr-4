const Joi = require('joi');
const { BaseValidator } = helpers;  

class LoginValidator extends BaseValidator {
    constructor() {
        super("login");
        const loginSchema = Joi.object({
          username: Joi.string()
            .email({ tlds: { allow: false } }) // Validate as an email address
            .required()
            .messages({
              'string.base': i18n.__('error.validation.email', "username"),
              'string.email': i18n.__('error.validation.email', "username"),
              'string.empty': i18n.__('error.validation.empty', "username"),
              'any.required': i18n.__('error.validation.required', "username")
            }),
          password: Joi.string()
            .required()
            .messages({
              'string.base': i18n.__('error.validation.email', "password"),
              'string.empty': i18n.__('error.validation.empty', "password"),
              'any.required':  i18n.__('error.validation.required', "password")
            })
        });
        const requestPasswordResetSchema = Joi.object({
          email: Joi.string()
              .email({ tlds: { allow: false } })
              .required()
              .messages({
                  'string.base': i18n.__('error.validation.email', 'email'),
                  'string.email': i18n.__('error.validation.email', 'email'),
                  'string.empty': i18n.__('error.validation.empty', 'email'),
                  'any.required': i18n.__(
                      'error.validation.required',
                      'email',
                  ),
              }),
      });
      this.addSchema('post', '/login', loginSchema);
      this.addSchema('post', '/request-password-reset', requestPasswordResetSchema);
        
    }
}

module.exports = new LoginValidator();
  