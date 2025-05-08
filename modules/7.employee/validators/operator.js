const { CRUDValidator, joyLibrary } = helpers;
const { operator } = models;

class OperatorValidator extends CRUDValidator {
    constructor() {
        super(operator);
        this.addFieldValidation('licenseNumber', joyLibrary.licenseNumberValidator);
    }
}

module.exports = new OperatorValidator();
