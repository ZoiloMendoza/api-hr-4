const { CRUDValidator } = helpers;
const { Client } = models;

class ClientValidator extends CRUDValidator {
    constructor() {
        super(Client);
    }
}

module.exports = new ClientValidator();