const { CRUDValidator, joyLibrary } = helpers;
const { client } = models;

const Joi = require('joi');
class ClientValidator extends CRUDValidator {
    constructor() {
        super(client);

        const addressesSchema = Joi.object({
            addresses: Joi.array().items(validators.address.schema),
        });

        const addressSchema = validators.address.schema;

        this.addFieldValidation('rfc', joyLibrary.rfcValidator);
        this.addSchema('put', '/client/:id/addresses', addressesSchema);
        this.addSchema('put', '/client/:id/address/:addressId', addressSchema);
        this.addSchema(
            'delete',
            '/client/:id/address/:addressId',
            Joi.object({}),
        );
        this.addSchema('post', '/client/:id/address', addressSchema);
        this.addSchema('get', '/client/:id/addresses', Joi.object({}));
    }
}

module.exports = new ClientValidator();
