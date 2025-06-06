const { CRUDValidator } = helpers;
const { location } = models;
const Joi = require('joi');
class LocationValidator extends CRUDValidator {
    constructor() {
        super(location);
        this.addSchema(
            'post',
            '/location/coordinates',
            Joi.object({
                escala: Joi.string().required(),
                x: Joi.number().min(-180).max(180).required(), // Longitud: -180 a 180
                y: Joi.number().min(-90).max(90).required(),
            }),
        );
        this.addSchema(
            'put',
            '/location-google/:id',
            Joi.object({
                name: Joi.string().max(100).required().messages({
                    'string.base': 'El nombre debe ser una cadena de texto.',
                    'string.max': 'El nombre no puede tener más de 100 caracteres.',
                    'any.required': 'El nombre es obligatorio.',
                }),
                description: Joi.string().max(100).optional().messages({
                    'string.base': 'La descripción debe ser una cadena de texto.',
                    'string.max': 'La descripción no puede tener más de 100 caracteres.',
                }),
                scale: Joi.number().min(1).max(10000).optional().messages({
                    'number.base': 'La escala debe ser un número.',
                    'number.min': 'La escala no puede ser menor a 1.',
                    'number.max': 'La escala no puede ser mayor a 10000.',
                }),
                lng: Joi.number().min(-180).max(180).required().messages({
                    'number.base': 'La longitud debe ser un número.',
                    'number.min': 'La longitud no puede ser menor a -180.',
                    'number.max': 'La longitud no puede ser mayor a 180.',
                    'any.required': 'La longitud es obligatoria.',
                }),
                lat: Joi.number().min(-90).max(90).required().messages({
                    'number.base': 'La latitud debe ser un número.',
                    'number.min': 'La latitud no puede ser menor a -90.',
                    'number.max': 'La latitud no puede ser mayor a 90.',
                    'any.required': 'La latitud es obligatoria.',
                }),
                city: Joi.string().max(50).optional().messages({
                    'string.base': 'La ciudad debe ser una cadena de texto.',
                    'string.max': 'La ciudad no puede tener más de 50 caracteres.',
                }),
                state: Joi.string().max(50).optional().messages({
                    'string.base': 'El estado debe ser una cadena de texto.',
                    'string.max': 'El estado no puede tener más de 50 caracteres.',
                }),
            }).unknown(true),
        );

        this.addSchema(
            'post',
            '/location-inegi-search',
            Joi.object({
                value: Joi.string().min(3).required().messages({
                    'string.base': 'El valor debe ser una cadena de texto.',
                    'string.min': 'El valor debe tener al menos 3 caracteres.',
                    'any.required': 'El valor es obligatorio.',
                }),
            }),
        );

        this.addSchema(
            'post',
            '/location-nominatim-search',
            Joi.object({
                value: Joi.string().min(3).required().messages({
                    'string.base': 'El valor debe ser una cadena de texto.',
                    'string.min': 'El valor debe tener al menos 3 caracteres.',
                    'any.required': 'El valor es obligatorio.',
                }),
            }),
        );

        this.addSchema(
            'post',
            '/address-autocomplete',
            Joi.object({
                value: Joi.string().min(3).required().messages({
                    'string.base': 'El valor debe ser una cadena de texto.',
                    'string.min': 'El valor debe tener al menos 3 caracteres.',
                    'any.required': 'El valor es obligatorio.',
                }),
            }),
        );
        this.addSchema(
            'post',
            '/address-geocoding',
            Joi.object({
                value: Joi.string().min(3).required().messages({
                    'string.base': 'El valor debe ser una cadena de texto.',
                    'string.min': 'El valor debe tener al menos 3 caracteres.',
                    'any.required': 'El valor es obligatorio.',
                }),
            }),
        );
    }
}

module.exports = new LocationValidator();
