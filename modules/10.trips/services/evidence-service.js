const { evidence } = models;
const { CRUDService } = helpers;

class EvidencesService extends CRUDService {
    constructor() {
        super(evidence);
    }
}
module.exports = new EvidencesService();
