const { segment } = models;
const { CRUDController } = helpers;

class SegmentsController extends CRUDController {
    constructor() {
        super(segment);
    }
}

const myself = new SegmentsController();

module.exports = myself.getApp();
