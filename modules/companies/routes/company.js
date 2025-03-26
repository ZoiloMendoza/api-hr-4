const { company } = models;
const { CRUDController } = helpers;

class CompanyController extends CRUDController {
    constructor() {
        super(company, process.env.SYSADMIN_ROLE);
    }
}
module.exports = new CompanyController();
