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

        this.addSchema(
            'post',
            '/trip/full',
            Joi.object({
                routeId: Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .messages({
                        'any.required': i18n.__('error.validation.required', 'routeId'),
                        'number.base': i18n.__('error.validation.number', 'routeId'),
                        'number.positive': i18n.__('error.validation.positive', 'routeId'),
                    }),
                vehicleId: Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .messages({
                        'any.required': i18n.__('error.validation.required', 'vehicleId'),
                        'number.base': i18n.__('error.validation.number', 'vehicleId'),
                        'number.positive': i18n.__('error.validation.positive', 'vehicleId'),
                    }),
                teleVia: Joi.string()
                    .optional()
                    .allow(null)
                    .messages({
                        'string.base': i18n.__('error.validation.string', 'teleVia'),
                    }),
                totalKm: Joi.number()
                    .min(0)
                    .optional()
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'totalKm'),
                        'number.min': i18n.__('error.validation.min', 'totalKm'),
                    }),
                mealsAmount: Joi.number()
                    .min(0)
                    .optional()
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'monto de comidas'),
                        'number.min': i18n.__('error.validation.min', 'monto de comidas'),
                    }),
                tollBoothsAmount: Joi.number()
                    .min(0)
                    .optional()
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'pago de casetas'),
                        'number.min': i18n.__('error.validation.min', 'pago de casetas'),
                    }),
                lodgingAmount: Joi.number()
                    .min(0)
                    .optional()
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'pago de hospedaje'),
                        'number.min': i18n.__('error.validation.min', 'pago de hospedaje'),
                    }),
                transitAmount: Joi.number()
                    .min(0)
                    .optional()
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'tarifa de movilidad'),
                        'number.min': i18n.__('error.validation.min', 'tarifa de movilidad'),
                    }),
                handlingAmount: Joi.number()
                    .min(0)
                    .optional()
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'pago de maniobras'),
                        'number.min': i18n.__('error.validation.min', 'pago de maniobras'),
                    }),
                fuelAmount: Joi.number()
                    .min(0)
                    .optional()
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'pago de combustible'),
                        'number.min': i18n.__('error.validation.min', 'pago de combustible'),
                    }),
                pendingExpenses: Joi.number()
                    .min(0)
                    .optional()
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'gastos por comprobar'),
                        'number.min': i18n.__('error.validation.min', 'gastos por comprobar'),
                    }),
                orders: Joi.array()
                    .items(
                        Joi.number()
                            .integer()
                            .positive()
                            .required()
                            .messages({
                                'any.required': i18n.__('error.validation.required', 'orderId'),
                                'number.base': i18n.__('error.validation.number', 'orderId'),
                                'number.positive': i18n.__('error.validation.positive', 'orderId'),
                            }),
                    )
                    .min(1)
                    .required()
                    .messages({
                        'array.base': i18n.__('error.validation.array', 'orders'),
                        'array.min': i18n.__('error.validation.min', 'orders'),
                        'any.required': i18n.__('error.validation.required', 'orders'),
                    }),
            }),
        );

        this.addSchema(
            'put',
            '/trip/:id/status',
            Joi.object({
                status: Joi.string()
                    .valid('documenting', 'emptyInTransit', 'loading', 'loadedInTransit', 'unloading', 'finished')
                    .required()
                    .messages({
                        'any.required': i18n.__('error.validation.required', 'status'),
                        'any.only': i18n.__('error.trip.validation.status.invalid', 'status'),
                    }),
            }),
        );
    }
}

module.exports = new TripValidator();
