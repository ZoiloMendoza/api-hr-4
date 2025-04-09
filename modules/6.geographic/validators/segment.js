const { CRUDValidator } = helpers;
const { segment } = models;

class SegmentValidator extends CRUDValidator {}

module.exports = new SegmentValidator(segment);
