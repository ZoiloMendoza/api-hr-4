const { CRUDValidator } = helpers;
const { vehicle } = models;

class VehicleValidator extends CRUDValidator {}

module.exports = new VehicleValidator(vehicle);
