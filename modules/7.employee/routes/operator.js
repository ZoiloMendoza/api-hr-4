const { operator, employee } = models;
const { CRUDController } = helpers;

class OperatorsController extends CRUDController {
    constructor() {
        super(operator);
        this.addRelation(employee, ['id'], 'employeeId');
    }
}

const myself = new OperatorsController();

module.exports = myself.getApp();
