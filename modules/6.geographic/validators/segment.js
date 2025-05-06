const { CRUDValidator } = helpers;
const { segment } = models;
const Joi = require('joi');
class SegmentValidator extends CRUDValidator {
    constructor() {
        super(segment);
        this.addSchema(
            'post',
            '/calculate-segment',
            Joi.object({
                optimalRoute: Joi.boolean().optional(),
                tollRoute: Joi.boolean().optional(),
                freeRoute: Joi.boolean().optional(),
                originId: Joi.number().required(),
                destinationId: Joi.number().required(),
                isFirst: Joi.boolean().optional(),
                segmentId: Joi.number().optional(),
            }),
        );
    }
}

module.exports = new SegmentValidator();
