const { evidence } = models;
const { CRUDController } = helpers;

class EvidencesController extends CRUDController {
    constructor() {
        super(evidence);
    }
}

const myself = new EvidencesController();

module.exports = myself.getApp();
