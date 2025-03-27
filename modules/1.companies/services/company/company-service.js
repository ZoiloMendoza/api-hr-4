const { company } = models;

const { CRUDService }= helpers;

class CompanyService extends CRUDService {
    constructor() {
        super(company);
    }
    
    createFirstCompany = async (name) => {
        const ncomp = await company.count();
        if (ncomp > 0) {
            throw new Error('Companies already exist');
        }
        return company.create({ name, active: true });
    }
}

module.exports = new CompanyService();
