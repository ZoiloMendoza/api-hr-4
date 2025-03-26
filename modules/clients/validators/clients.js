const { CRUDValidator } = helpers;
const { client } = models;

class ClientValidator extends CRUDValidator {
    constructor() {
        super(client);
    }
}

module.exports = new ClientValidator();