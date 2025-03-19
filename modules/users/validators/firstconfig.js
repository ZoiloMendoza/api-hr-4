const Joi = require('joi');
const { BaseValidator } = helpers;

class FirstConfigValidator extends BaseValidator {
    constructor() {
        super("firstconfig");
        this.configSchema = Joi.object({
            company: Joi.string()
              .required()
              .messages({
                'string.base': i18n.__('error.validation.required', "company"),
                'string.empty': i18n.__('error.validation.empty', "company"),
                'any.required': i18n.__('error.validation.required', "company")
              }),
              username: Joi.string()
              .required().
              email()
              .messages({
                'string.base': i18n.__('error.validation.required', "username"),
                'string.empty': i18n.__('error.validation.empty', "username"),
                'any.required': i18n.__('error.validation.required', "username"),
                'string.email': i18n.__('error.validation.email', "username")
              }),
        });

    }

    setValidation(needed = false) {
        if (needed) {
            this.addSchema('post', '/firstconfig', this.configSchema);
        } else {
            this.addSchema('post', '/firstconfig', Joi.object({}));
        }
    }
}

module.exports = new FirstConfigValidator();