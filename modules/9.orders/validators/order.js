const { CRUDValidator } = helpers;
const { order } = models;
const Joi = require('joi');
class OrderValidator extends CRUDValidator {
    constructor() {
        super(order);

        this.addFieldValidation(
            'status',
            Joi.string()
                .valid('pending', 'assigned', 'delivered')
                .required()
                .messages({
                    'any.required': i18n.__('error.validation.required', 'status'),
                    'any.only': i18n.__('error.order.validation.status.invalid', 'status'),
                }),
        );
    }
}

module.exports = new OrderValidator();
