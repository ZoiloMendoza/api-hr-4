const { employeetype } = models;
const { CRUDService } = helpers;

class EmployeetypesService extends CRUDService {
    constructor() {
        super(employeetype);
    }
}
module.exports = new EmployeetypesService();
