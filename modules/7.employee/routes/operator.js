const { operator } = models;
const { CRUDController } = helpers;

class OperatorsController extends CRUDController {
    constructor() {
        super(operator);
    }
}

const myself = new OperatorsController();

module.exports = myself.getApp();
