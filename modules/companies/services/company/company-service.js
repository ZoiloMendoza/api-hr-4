const { Company } = models;

const { CRUDService }= helpers;

class CompanyService extends CRUDService {
    constructor() {
        super(Company);
    }
    
    createFirstCompany = async (name) => {
        const ncomp = await Company.count();
        if (ncomp > 0) {
            throw new Error('Companies already exist');
        }
        return Company.create({ name, active: true });
    }
}

module.exports = new CompanyService();
