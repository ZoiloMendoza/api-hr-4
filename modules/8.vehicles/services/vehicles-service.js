const { vehicle, operator } = models;
const { CRUDService, entityErrors, SearchResult } = helpers;

class VehiclesService extends CRUDService {
    constructor() {
        super(vehicle);
    }

    async getVehiclesWithOperatorsAndEmployees(q) {
        const items = await this.findAndCountAllCustom({
            offset: q.start,
            limit: q.limit,
            filter: q.filter,
            where: {
                status: 'available',
            },
            order: [[q.orderBy, q.order]],
            include: [
                {
                    model: operator,
                    as: 'operator',
                    attributes: ['id', 'status', 'licenseNumber', 'licenseExpiry', 'debt'],
                    required: true,
                    include: [
                        {
                            model: models.employee,
                            as: 'employee',
                            attributes: ['firstName', 'lastName'],
                        },
                    ],
                },
            ],
        });

        if (!items.rows.length) {
            throw new entityErrors.EntityNotFoundError('No hay vehículos disponibles');
        }

        return { rows: items.rows, count: items.count };
    }
    async getVehicleWithOperatorsAndEmployeesById(vehicleId) {
        const item = await this.model.findOne({
            where: {
                id: vehicleId,
                active: true,
            },
            attributes: { exclude: ['active', 'companyId', 'createdAt', 'updatedAt'] },
            include: [
                {
                    model: operator,
                    as: 'operator',
                    attributes: ['id', 'status', 'licenseNumber', 'licenseExpiry', 'debt'],
                    required: true,
                    include: [
                        {
                            model: models.employee,
                            as: 'employee',
                            attributes: ['firstName', 'lastName'],
                        },
                    ],
                },
            ],
        });

        if (!item) {
            throw new entityErrors.EntityNotFoundError('El vehículo especificado no existe o no está activo');
        }

        return item;
    }
}
module.exports = new VehiclesService();
