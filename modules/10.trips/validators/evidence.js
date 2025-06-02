const { evidence } = models;
const { CRUDValidator } = helpers;
const Joi = require('joi');
class EvidenceValidator extends CRUDValidator {
    constructor() {
        super(evidence);
        this.addSchema(
            'post',
            '/evidence/full',
            Joi.object({
                evidenceTypeId: Joi.number().integer().positive().required(),
                tripId: Joi.number().integer().positive().required(),
                evidencePhoto: Joi.array()
                    .items(
                        Joi.object({
                            description: Joi.string().optional().allow(null),
                            actionRefId: Joi.string().optional().allow(null),
                            imgFile: Joi.any().optional(),
                        }),
                    )
                    .min(1)
                    .required(),
            }),
        );
        this.routes.get['/trip/:id/evidence-with-photo'] = false;
    }
}

module.exports = new EvidenceValidator();
