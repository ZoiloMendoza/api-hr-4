const { employeetype } = models;
const { CRUDController } = helpers;

class EmployeetypesController extends CRUDController {
    constructor() {
        super(employeetype);
    }
}

const myself = new EmployeetypesController();

module.exports = myself.getApp();
