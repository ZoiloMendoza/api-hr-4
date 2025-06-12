const { vehicle, operator, trip } = models;
const { CRUDService, entityErrors, SearchResult } = helpers;
const { Op } = require('sequelize');

class VehiclesService extends CRUDService {
    constructor() {
        super(vehicle);
    }

    async create(data) {
        const loggedUser = this.getLoggedUser();
        if (data.operatorId) {
            const existing = await this.model.findOne({
                where: { operatorId: data.operatorId, active: true },
            });
            if (existing) {
                throw new entityErrors.EntityNotFoundError('El operador ya está asignado a otro vehículo.');
            }
        }

        const newVehicle = await super.create(data);

        if (data.operatorId) {
            const op = await operator.findByPk(data.operatorId, { where: { active: true } });
            if (op) {
                const oldStatus = op.status;
                await op.update({ status: 'unavailable' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'operator',
                        entityId: op.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: 'unavailable' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        return newVehicle;
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

    async update(id, data) {
        const loggedUser = this.getLoggedUser();
        if (data.operatorId) {
            const existing = await this.model.findOne({
                where: { operatorId: data.operatorId, active: true, id: { [Op.ne]: id } },
            });
            if (existing) {
                throw new entityErrors.EntityNotFoundError('El operador ya está asignado a otro vehículo.');
            }
        }

        const current = await this._readById(id);

        if (data.status === 'available' && current.status !== 'available') {
            const activeTrip = await trip.findOne({
                where: { vehicleId: id, active: true, status: { [Op.not]: 'finished' } },
            });
            if (activeTrip) {
                throw new entityErrors.EntityNotFoundError(
                    `El vehículo no puede cambiar su status, porque está asignado al viaje con folio ${activeTrip.tripCode}.`,
                );
            }
        }

        const oldData = { ...current.dataValues };
        await current.update(data);

        if (oldData.active && current.active === false && current.operatorId) {
            await current.update({ operatorId: null }, { hooks: false });
        }

        if (current.operatorId && current.operatorId !== oldData.operatorId) {
            if (oldData.operatorId) {
                const prevOp = await operator.findByPk(oldData.operatorId, { where: { active: true } });
                if (prevOp) {
                    const prevStatus = prevOp.status;
                    await prevOp.update({ status: 'available' });
                    if (services.auditlogService) {
                        await services.auditlogService.createLog({
                            entityName: 'operator',
                            entityId: prevOp.id,
                            action: 'update',
                            oldData: { status: prevStatus },
                            newData: { status: 'available' },
                            userId: loggedUser.id,
                            username: loggedUser.username,
                            companyId: loggedUser.company.id,
                        });
                    }
                }
            }
        }

        if (current.operatorId) {
            const op = await operator.findByPk(current.operatorId, { where: { active: true } });
            if (op) {
                const oldStatus = op.status;
                await op.update({ status: 'unavailable' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'operator',
                        entityId: op.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: 'unavailable' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        if (!current.operatorId && oldData.operatorId) {
            const prevOp = await operator.findByPk(oldData.operatorId, { where: { active: true } });
            if (prevOp) {
                const prevStatus = prevOp.status;
                await prevOp.update({ status: 'available' });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'operator',
                        entityId: prevOp.id,
                        action: 'update',
                        oldData: { status: prevStatus },
                        newData: { status: 'available' },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        if (services.auditlogService) {
            await services.auditlogService.createLog({
                entityName: this.modelName,
                entityId: current.id,
                action: 'update',
                oldData,
                newData: current.dataValues,
                userId: loggedUser.id,
                username: loggedUser.username,
                companyId: loggedUser.company.id,
            });
        }

        const updated = await this._readById(id);
        return this.toJson(updated);
    }

    async getVehicleWithOperatorsAndEmployeesById(vehicleId) {
        const loggedUser = this.getLoggedUser();
        const item = await this.model.findOne({
            where: {
                id: vehicleId,
                active: true,
                companyId: loggedUser.company.id,
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
                            attributes: ['firstName', 'lastName', 'phoneOffice', 'phoneMobile', 'rfc'],
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
