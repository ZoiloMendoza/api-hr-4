const { CRUDValidator } = helpers;
const { location } = models;

class LocationValidator extends CRUDValidator {}

module.exports = new LocationValidator(location);
