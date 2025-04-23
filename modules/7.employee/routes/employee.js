const { employee } = models;
const { CRUDController } = helpers;

class EmployeesController extends CRUDController {
    constructor() {
        super(employee);
    }
}

const myself = new EmployeesController();

module.exports = myself.getApp();
