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
                    .positive()
                    .required()
                    .messages({
                        'any.required': i18n.__('error.validation.required', 'totalKm'),
                        'number.base': i18n.__('error.validation.number', 'totalKm'),
                        'number.positive': i18n.__('error.validation.positive', 'totalKm'),
                    }),
                mealsAmount: Joi.number()
                    .positive()
                    .optional()
                    .default(0)
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'mealsAmount'),
                        'number.positive': i18n.__('error.validation.positive', 'mealsAmount'),
                    }),
                tollBoothsAmount: Joi.number()
                    .positive()
                    .optional()
                    .default(0)
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'tollBoothsAmount'),
                        'number.positive': i18n.__('error.validation.positive', 'tollBoothsAmount'),
                    }),
                lodgingAmount: Joi.number()
                    .positive()
                    .optional()
                    .default(0)
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'lodgingAmount'),
                        'number.positive': i18n.__('error.validation.positive', 'lodgingAmount'),
                    }),
                transitAmount: Joi.number()
                    .positive()
                    .optional()
                    .default(0)
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'transitAmount'),
                        'number.positive': i18n.__('error.validation.positive', 'transitAmount'),
                    }),
                handlingAmount: Joi.number()
                    .positive()
                    .optional()
                    .default(0)
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'handlingAmount'),
                        'number.positive': i18n.__('error.validation.positive', 'handlingAmount'),
                    }),
                fuelAmount: Joi.number()
                    .positive()
                    .optional()
                    .default(0)
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'fuelAmount'),
                        'number.positive': i18n.__('error.validation.positive', 'fuelAmount'),
                    }),
                pendingExpenses: Joi.number()
                    .positive()
                    .optional()
                    .default(0)
                    .messages({
                        'number.base': i18n.__('error.validation.number', 'pendingExpenses'),
                        'number.positive': i18n.__('error.validation.positive', 'pendingExpenses'),
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
    }
}

module.exports = new TripValidator();
