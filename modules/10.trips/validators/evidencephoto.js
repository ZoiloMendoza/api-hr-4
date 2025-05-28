const { evidencephoto } = models;
const { CRUDValidator } = helpers;
const Joi = require('joi');
class EvidencephotoValidator extends CRUDValidator {
    constructor() {
        super(evidencephoto);

        this.addSchema(
            'post',
            '/evidencephoto/upload',
            Joi.object({
                evidenceId: Joi.number().optional().messages({
                    'number.base': 'El ID de evidencia debe ser un número.',
                    'any.required': 'El ID de evidencia es obligatorio.',
                }),
                description: Joi.string().max(255).optional().messages({
                    'string.base': 'La descripción debe ser un texto.',
                    'string.max': 'La descripción no puede exceder los 255 caracteres.',
                }),
                actionRefId: Joi.string().max(64).optional().messages({
                    'string.base': 'El ID de acción debe ser un texto.',
                    'string.max': 'El ID de acción no puede exceder los 64 caracteres.',
                }),
            }).options({ stripUnknown: true }),
        );
    }
}

module.exports = new EvidencephotoValidator();
