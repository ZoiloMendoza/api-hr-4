const { evidencetype } = models;
const { CRUDController } = helpers;

class EvidencetypesController extends CRUDController {
    constructor() {
        super(evidencetype);
    }
}

const myself = new EvidencetypesController();

module.exports = myself.getApp();
