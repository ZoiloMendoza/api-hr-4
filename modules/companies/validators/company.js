const { CRUDValidator } = helpers;
const { Company } = models;
const Joi = require('joi');

class CompanyValidator extends CRUDValidator {
    constructor() {
        super(Company);

        const companySchemaPost = Joi.object({
            razonSocial: Joi.string()
                .required()
                .messages({
                    'string.base': i18n.__(
                        'error.validation.string',
                        'razonSocial',
                    ),
                    'string.empty': i18n.__(
                        'error.validation.empty',
                        'razonSocial',
                    ),
                    'any.required': i18n.__(
                        'error.validation.required',
                        'razonSocial',
                    ),
                }),
            name: Joi.string()
                .optional()
                .messages({
                    'string.base': i18n.__('error.validation.string', 'name'),
                    'string.empty': i18n.__('error.validation.empty', 'name'),
                }),
            urlBase: Joi.string()
                .optional()
                .messages({
                    'string.base': i18n.__(
                        'error.validation.string',
                        'urlBase',
                    ),
                    'string.empty': i18n.__(
                        'error.validation.empty',
                        'urlBase',
                    ),
                }),
        });

        const companySchemaPut = Joi.object({
            razonSocial: Joi.string()
                .optional()
                .messages({
                    'string.base': i18n.__(
                        'error.validation.string',
                        'razonSocial',
                    ),
                    'string.empty': i18n.__(
                        'error.validation.empty',
                        'razonSocial',
                    ),
                }),
            name: Joi.string()
                .optional()
                .messages({
                    'string.base': i18n.__('error.validation.string', 'name'),
                    'string.empty': i18n.__('error.validation.empty', 'name'),
                }),
            urlBase: Joi.string()
                .optional()
                .messages({
                    'string.base': i18n.__(
                        'error.validation.string',
                        'urlBase',
                    ),
                    'string.empty': i18n.__(
                        'error.validation.empty',
                        'urlBase',
                    ),
                }),
        });

        this.routes.post['/company'] = this.genValidator(companySchemaPost);
        this.routes.put['/company/:id'] = this.genValidator(companySchemaPut);
    }
}

module.exports = new CompanyValidator();
