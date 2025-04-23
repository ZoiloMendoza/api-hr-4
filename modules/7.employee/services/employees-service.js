const { employee } = models;
const { CRUDService } = helpers;

class EmployeesService extends CRUDService {
    constructor() {
        super(employee);
    }
}

module.exports = new EmployeesService();
