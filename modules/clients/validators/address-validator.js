const { CRUDValidator } = helpers;
const { address } = models;

class AddressValidator extends CRUDValidator {
    constructor() {
        super(address);
    }
}

module.exports = new AddressValidator();