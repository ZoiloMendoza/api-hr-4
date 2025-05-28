const { evidencephoto } = models;
const { CRUDService } = helpers;

class EvidencephotosService extends CRUDService {
    constructor() {
        super(evidencephoto);
    }
}
module.exports = new EvidencephotosService();
