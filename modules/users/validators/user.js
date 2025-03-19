const { CRUDValidator } = helpers;
const { User } = models;
const Joi = require('joi');

class UserValidator extends CRUDValidator {
    constructor() {
        super(User);

        // Replace the schema for user update, password is ignored
        const updateValidator = this.schema.fork(['password'], (schema) => schema.optional().strip());
        this.addSchema("put", "/user/:id", updateValidator);
        
        const roleSchema = Joi.object({
            roles: Joi.array().items(Joi.string()).required()
            .messages({
              "string.base": i18n.__("error.validation.string", "roles"),
              "string.empty": i18n.__("error.validation.empty", "roles"),
              "any.required": i18n.__("error.validation.required", "roles"),
            }),
        });
        const passwordSchema = Joi.object({
            password: Joi.string()
              .required()
              .messages({
                'string.base': i18n.__('error.validation.email', "password"),
                'string.empty': i18n.__('error.validation.empty', "password"),
                'any.required':  i18n.__('error.validation.required', "password")
              })
        });

        
        this.addSchema("put", "/user/:id/password", passwordSchema);        
        this.addSchema("put", "/user/:id/roles", roleSchema)
        this.addSchema("delete", "/user/:id/roles", roleSchema);
    }
}

module.exports = new UserValidator();