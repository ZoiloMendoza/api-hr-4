const { evidence, evidencephoto } = models;
const { CRUDController } = helpers;

class EvidencesController extends CRUDController {
    constructor() {
        super(evidence);
        this.addRelation(evidencephoto, ['id']);
    }
}

const myself = new EvidencesController();

module.exports = myself.getApp();
