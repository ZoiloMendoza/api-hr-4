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
            'operatorId',
            Joi.number()
                .integer()
                .allow(null)
                .messages({
                    'number.base': i18n.__('error.validation.number', 'operatorId'),
                    'any.required': i18n.__('error.validation.required', 'operatorId'),
                })
                .optional(),
        );
        this.addFieldValidation(
            'vehicleYear',
            Joi.number()
                .integer()
                .min(1980)
                .max(2100)
                .messages({
                    'number.base': i18n.__('error.validation.number', 'vehicleYear'),
                    'number.min': i18n.__('error.vehicle.validation.vehicleYear.min', 'vehicleYear'),
                    'number.max': i18n.__('error.vehicle.validation.vehicleYear.max', 'vehicleYear'),
                    'any.required': i18n.__('error.validation.required', 'vehicleYear'),
                })
                .optional(),
        );

        this.routes.get['/vehicles/available-with-operators'] = false;
        this.routes.get['/vehicles/available-with-operators/:vehicleId'] = false;
    }
}

module.exports = new VehicleValidator();
