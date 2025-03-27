const Joi = require('joi');
const { BaseValidator } = helpers;

class CatalogValidator extends BaseValidator {
    constructor() {
        super("catalog");
        const catalogSchemaPost = Joi.object({
            name: Joi.string()
                .required()
                .messages({
                    'any.required': i18n.__(
                        'error.validation.required',
                        'name',
                    ),
                }),

            description: Joi.string().optional(),
        });
        const catalogSchemaPut = Joi.object({
            name: Joi.string().optional(),
            description: Joi.string().optional(),
        });
        this.routes.get['/catalogs'] = false;
        this.routes.get['/catalog/:type'] = false;
        this.routes.get['/catalog/:type/:id'] = false;
        this.routes.post['/catalog/:type'] =
            this.genValidator(catalogSchemaPost);
        this.routes.put['/catalog/:type/:id'] =
            this.genValidator(catalogSchemaPut);
        this.routes.delete['/catalog/:type/:id'] = false;
    }
}

module.exports = new CatalogValidator();
