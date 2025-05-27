const { evidencetype } = models;
const { CRUDValidator } = helpers;

class EvidencetypeValidator extends CRUDValidator {}

module.exports = new EvidencetypeValidator(evidencetype);
