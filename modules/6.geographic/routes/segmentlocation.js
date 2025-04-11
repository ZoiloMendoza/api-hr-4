const { segmentlocation } = models;
const { CRUDController } = helpers;

class SegmentlocationsController extends CRUDController {
    constructor() {
        super(segmentlocation);
    }
}
const myself = new SegmentlocationsController();

module.exports = myself.getApp();
