const { evidence } = models;
const { CRUDValidator } = helpers;

class EvidenceValidator extends CRUDValidator {}

module.exports = new EvidenceValidator(evidence);
