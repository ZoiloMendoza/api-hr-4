const { employeetype, paymenttype } = models;
const { CRUDController } = helpers;

class EmployeetypesController extends CRUDController {
    constructor() {
        super(employeetype);
        this.addRelation(paymenttype, ['id']);
    }
}

const myself = new EmployeetypesController();

module.exports = myself.getApp();
