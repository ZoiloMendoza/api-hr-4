const { CRUDValidator, joyLibrary } = helpers;
const { employee } = models;
const Joi = require('joi');
class EmployeeValidator extends CRUDValidator {
    constructor() {
        super(employee);

        const addressesSchema = Joi.object({
            addresses: Joi.array().items(validators.address.schema),
        });

        const addressSchema = validators.address.schema;

        this.addFieldValidation('rfc', joyLibrary.rfcValidator);
        this.addSchema('put', '/employee/:id/addresses', addressesSchema);
        this.addSchema('put', '/employee/:id/address/:addressId', addressSchema);
        this.addSchema('delete', '/employee/:id/address/:addressId', Joi.object({}));
        this.addSchema('post', '/employee/:id/address', addressSchema);
        this.addSchema('get', '/employee/:id/addresses', Joi.object({}));
    }
}

module.exports = new EmployeeValidator();
