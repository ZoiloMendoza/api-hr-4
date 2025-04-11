const { segmentlocation } = models;
const { CRUDService } = helpers;

class SegmentlocationsService extends CRUDService {
    constructor() {
        super(segmentlocation);
    }
}
module.exports = new SegmentlocationsService();
