const { CRUDValidator, joyLibrary } = helpers;
const { client } = models;

class ClientValidator extends CRUDValidator {
    constructor() {
        super(client);
        this.addFieldValidation('rfc', joyLibrary.rfcValidator);

    }
}

module.exports = new ClientValidator();