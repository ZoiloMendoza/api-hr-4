const { CRUDValidator } = helpers;
const { route } = models;
const Joi = require('joi');
class RouteValidator extends CRUDValidator {
    constructor() {
        super(route);
        this.addSchema(
            'post',
            '/route/full',
            Joi.object({
                fuelAmount: Joi.number().positive().required().messages({
                    'number.base':
                        'El monto de combustible debe ser un número.',
                    'number.positive':
                        'El monto de combustible debe ser positivo.',
                    'any.required': 'El monto de combustible es obligatorio.',
                }),
                handlingAmount: Joi.number().positive().required().messages({
                    'number.base': 'El monto por maniobras debe ser un número.',
                    'number.positive':
                        'El monto por maniobras debe ser positivo.',
                    'any.required': 'El monto por maniobras es obligatorio.',
                }),
                lodgingAmount: Joi.number().positive().required().messages({
                    'number.base': 'El monto por hospedaje debe ser un número.',
                    'number.positive':
                        'El monto por hospedaje debe ser positivo.',
                    'any.required': 'El monto por hospedaje es obligatorio.',
                }),
                mealsAmount: Joi.number().positive().required().messages({
                    'number.base': 'El monto por comidas debe ser un número.',
                    'number.positive':
                        'El monto por comidas debe ser positivo.',
                    'any.required': 'El monto por comidas es obligatorio.',
                }),
                routeSalary: Joi.number().positive().required().messages({
                    'number.base': 'El salario de la ruta debe ser un número.',
                    'number.positive':
                        'El salario de la ruta debe ser positivo.',
                    'any.required': 'El salario de la ruta es obligatorio.',
                }),
                // routeType: Joi.string()
                //     .valid('optima', 'economica', 'rapida')
                //     .required()
                //     .messages({
                //         'string.base': 'El tipo de ruta debe ser un texto.',
                //         'any.only':
                //             'El tipo de ruta debe ser "optima", "economica" o "rapida".',
                //         'any.required': 'El tipo de ruta es obligatorio.',
                //     }),
                tollBoothsAmount: Joi.number().positive().required().messages({
                    'number.base': 'El monto por casetas debe ser un número.',
                    'number.positive':
                        'El monto por casetas debe ser positivo.',
                    'any.required': 'El monto por casetas es obligatorio.',
                }),
                totalKm: Joi.number().positive().required().messages({
                    'number.base': 'El total de kilómetros debe ser un número.',
                    'number.positive':
                        'El total de kilómetros debe ser positivo.',
                    'any.required': 'El total de kilómetros es obligatorio.',
                }),
                transitAmount: Joi.number().positive().required().messages({
                    'number.base': 'El monto por tránsito debe ser un número.',
                    'number.positive':
                        'El monto por tránsito debe ser positivo.',
                    'any.required': 'El monto por tránsito es obligatorio.',
                }),
                segments: Joi.array()
                    .items(
                        Joi.object({
                            segmentId: Joi.number()
                                .integer()
                                .positive()
                                .required()
                                .messages({
                                    'number.base':
                                        'El ID del segmento debe ser un número.',
                                    'number.integer':
                                        'El ID del segmento debe ser un número entero.',
                                    'number.positive':
                                        'El ID del segmento debe ser positivo.',
                                    'any.required':
                                        'El ID del segmento es obligatorio.',
                                }),
                            orderIndex: Joi.number()
                                .integer()
                                .positive()
                                .required()
                                .messages({
                                    'number.base':
                                        'El índice de orden debe ser un número.',
                                    'number.integer':
                                        'El índice de orden debe ser un número entero.',
                                    'number.positive':
                                        'El índice de orden debe ser positivo.',
                                    'any.required':
                                        'El índice de orden es obligatorio.',
                                }),
                        }),
                    )
                    .min(1)
                    .required()
                    .messages({
                        'array.base': 'Los Tramos deben ser un arreglo.',
                        'array.min': 'Debe proporcionar al menos un Tramo.',
                        'any.required': 'Los Tramos son requeridos.',
                    }),
            }),
        );
    }
}

module.exports = new RouteValidator();
