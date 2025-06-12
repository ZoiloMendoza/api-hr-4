const { CRUDValidator } = helpers;
const { service } = models;

class ServiceValidator extends CRUDValidator {
    constructor() {
        super(service);
    }
}

module.exports = new ServiceValidator();
