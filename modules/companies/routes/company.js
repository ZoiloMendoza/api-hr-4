const { Company } = models;
const { CRUDController } = helpers;

class CompanyController extends CRUDController {
    constructor() {
        super(Company, process.env.SYSADMIN_ROLE);
    }
}
module.exports = new CompanyController();
