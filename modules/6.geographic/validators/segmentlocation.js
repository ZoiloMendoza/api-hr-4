const { segmentlocation } = models;
const { CRUDValidator } = helpers;

class SegmentlocationValidator extends CRUDValidator {}

module.exports = new SegmentlocationValidator(segmentlocation);
