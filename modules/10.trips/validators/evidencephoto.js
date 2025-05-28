const { evidencephoto } = models;
const { CRUDValidator } = helpers;

class EvidencephotoValidator extends CRUDValidator {}

module.exports = new EvidencephotoValidator(evidencephoto);
