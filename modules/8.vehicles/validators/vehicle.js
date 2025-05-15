const { CRUDValidator } = helpers;
const { vehicle } = models;
const Joi = require('joi');
class VehicleValidator extends CRUDValidator {
    constructor() {
        super(vehicle);

        this.addFieldValidation(
            'status',
            Joi.string()
                .valid('available', 'unavailable', 'maintenance')
                .required()
                .messages({
                    'any.required': i18n.__('error.validation.required', 'status'),
                    'any.only': i18n.__('error.vehicle.validation.status.invalid', 'status'),
                }),
        );
        this.addFieldValidation(
            'vehicleYear',
            Joi.number()
                .integer()
                .min(1980)
                .max(2100)
                .message('El campo vehicleYear debe ser un número de 4 dígitos (por ejemplo, 2025)')
                .optional(),
        );
    }
}

module.exports = new VehicleValidator();
