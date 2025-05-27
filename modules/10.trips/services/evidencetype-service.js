const { evidencetype } = models;
const { CRUDService } = helpers;

class EvidencetypesService extends CRUDService {
    constructor() {
        super(evidencetype);
    }
}
module.exports = new EvidencetypesService();
