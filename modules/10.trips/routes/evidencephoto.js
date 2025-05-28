const { evidencephoto, evidence } = models;
const { CRUDController } = helpers;

class EvidencephotosController extends CRUDController {
    constructor() {
        super(evidencephoto);
        this.addRelation(evidence, ['id']);
    }
}

const myself = new EvidencephotosController();

module.exports = myself.getApp();
