const { CRUDValidator, joyLibrary } = helpers;
const { client, address } = models;

const Joi = require('joi');
class ClientValidator extends CRUDValidator {
    constructor() {
        super(client);
        const addressSchema = Joi.object({
            addresses: Joi.array().items(validators.address.schema),
        });
        this.addFieldValidation('rfc', joyLibrary.rfcValidator);
        this.addSchema('put', '/client/:id/addresses', addressSchema);
        this.addSchema('get', '/client/:id/addresses', Joi.object({}));
    }
}

module.exports = new ClientValidator();
