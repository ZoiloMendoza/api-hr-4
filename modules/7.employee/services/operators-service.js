const { operator } = models;
const { CRUDService, entityErrors } = helpers;

class OperatorsService extends CRUDService {
    constructor() {
        super(operator);
    }

    async update(id, data) {
        if (data.status === 'available') {
            const current = await this._readById(id);
            if (current.status !== 'available') {
                const assignedVehicle = await models.vehicle.findOne({
                    where: { operatorId: id, active: true },
                });
                if (assignedVehicle) {
                    throw new entityErrors.EntityNotFoundError(
                        i18n.__(
                            `El operador no puede cambiar su status, porque está asignado al vehículo con placas ${assignedVehicle.licensePlate}.`,
                        ),
                    );
                }
            }
        }
        return super.update(id, data);
    }
}
module.exports = new OperatorsService();
