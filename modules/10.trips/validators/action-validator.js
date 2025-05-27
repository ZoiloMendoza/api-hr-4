const { CRUDValidator } = helpers;
const { action } = models;

class ActionValidator extends CRUDValidator {
    constructor() {
        super(action);
    }
}

module.exports = new ActionValidator();
