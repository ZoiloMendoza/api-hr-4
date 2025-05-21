const { CRUDValidator, joyLibrary } = helpers;
const { operator } = models;
const Joi = require('joi');
class OperatorValidator extends CRUDValidator {
    constructor() {
        super(operator);
        this.addFieldValidation('licenseNumber', joyLibrary.licenseNumberValidator);

        this.addFieldValidation(
            'status',
            Joi.string()
                .valid('available', 'unavailable')
                .required()
                .messages({
                    'any.required': i18n.__('error.validation.required', 'status'),
                    'any.only': i18n.__('error.operator.validation.status.invalid', 'status'),
                }),
        );
    }
}

module.exports = new OperatorValidator();
