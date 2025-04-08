const { CRUDValidator } = helpers;
const { ubication } = models;

class UbicationValidator extends CRUDValidator {}

module.exports = new UbicationValidator(ubication);
