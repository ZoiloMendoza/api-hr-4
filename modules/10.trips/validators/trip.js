const { CRUDValidator } = helpers;
const { trip } = models;
const Joi = require('joi');

class TripValidator extends CRUDValidator {
    constructor() {
        super(trip);

        this.addFieldValidation(
            'status',
            Joi.string()
                .valid('documenting', 'emptyInTransit', 'loading', 'loadedInTransit', 'unloading', 'finished')
                .required()
                .messages({
                    'any.required': i18n.__('error.validation.required', 'status'),
                    'any.only': i18n.__('error.trip.validation.status.invalid', 'status'),
                }),
        );
    }
}

module.exports = new TripValidator();
