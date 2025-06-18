'use strict';
const { serviceorder, vehicle } = models;
const { CRUDService, entityErrors } = helpers;
const crypto = require('crypto');



class ServiceOrdenService extends CRUDService {
    constructor() {
        super(serviceorder);
    }

    async addServiceOrdenSparePart(serviceOrdenId, newSparePart) {
        const serviceOrdenDb = await this.readById(serviceOrdenId);
        if (!serviceOrdenDb) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Orden de Servicio'),
            );
        }

        if (!serviceOrdenDb.spareParts) {
            serviceOrdenDb.spareParts = [];
        }
        newSparePart.refId = crypto.randomBytes(8).toString('hex');
        serviceOrdenDb.spareParts.push(newSparePart);
        const total = newSparePart.cost * newSparePart.quantity;
        serviceOrdenDb.total = (parseFloat(serviceOrdenDb.total) + total);

        await this.update(serviceOrdenId, serviceOrdenDb);

        return {
            ...newSparePart,
            id: newSparePart.refId,
        };
    }

    async updateServiceOrderSparePartById(serviceOrdenId, sparePartId, updatedSparePart) {
        const serviceOrdenDb = await this.readById(serviceOrdenId);
        if (!serviceOrdenDb) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Orden de Servicio'),
            );
        }

        if (!serviceOrdenDb.spareParts) {
            serviceOrdenDb.spareParts = [];
        }

        const sparePartIndex = serviceOrdenDb.spareParts.findIndex((sparepart) => sparepart.refId === sparePartId);

        if (sparePartIndex === -1) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Refaccion'));
        }

        const currentSparePart = serviceOrdenDb.spareParts[sparePartIndex];
        const lastTotal = currentSparePart.quantity * currentSparePart.cost;
        const newTotal = updatedSparePart.quantity * updatedSparePart.cost;

        if (lastTotal !== newTotal) {
            serviceOrdenDb.total = parseFloat(serviceOrdenDb.total) - lastTotal + newTotal;
        }
        serviceOrdenDb.spareParts[sparePartIndex] = {
            ...currentSparePart,
            ...updatedSparePart,
        };

        await this.update(serviceOrdenId, serviceOrdenDb);

        return {
            ...serviceOrdenDb.spareParts[sparePartIndex],
            id: sparePartId,
        };
    }

    async deleteServiceOrdenSparePartById(serviceOrdenId, sparePartId) {
        const serviceOrdenDb = await this.readById(serviceOrdenId);
        if (!serviceOrdenDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Orden de Servicio'));
        }

        if (!serviceOrdenDb.service) {
            serviceOrdenDb.service = [];
        }

        const sparePartIndex = serviceOrdenDb.spareParts.findIndex((service) => service.refId === sparePartId);

        if (sparePartIndex === -1) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Refaccion'));
        }

        const deletedSparePart = serviceOrdenDb.spareParts[sparePartIndex];

        serviceOrdenDb.spareParts.splice(sparePartIndex, 1);
        const total = deletedSparePart.cost * deletedSparePart.quantity;
        serviceOrdenDb.total = (parseFloat(serviceOrdenDb.total) - total);

        await this.update(serviceOrdenId, serviceOrdenDb);

        return {
            ...deletedSparePart,
            id: sparePartId,
        };
    }

    async getServiceOrdenSpareParts(serviceOrdenId) {
        const serviceOrdenDb = await this.readById(serviceOrdenId);
        if (!serviceOrdenDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Orden de Servicio'));
        }

        if (!serviceOrdenDb.spareParts) {
            serviceOrdenDb.spareParts = [];
        }

        return serviceOrdenDb.spareParts.map((sparePart) => ({
            ...sparePart,
            id: sparePart.refId,
            serviceOrdenId: serviceOrdenId,
        }));
    }

    async create(data, confirm = false, replace = false) {
        const loggedUser = this.getLoggedUser();
        data.folio = this.generarFolio();

        if (data.vehicleId) {
            const veh = await vehicle.findOne({ where: { id: data.vehicleId, active: true } });
            if (!veh) {
                throw new entityErrors.EntityNotFoundError(
                    i18n.__('entity not found', 'Vehicle'),
                );
            }

            // Validar que el vehículo NO esté en mantenimiento
            if (veh.status === 'maintenance') {
                throw new entityErrors.GenericError(
                    'El vehículo ya está en mantenimiento'
                );
            }
        }

        const order = await super.create(data, confirm, replace);

        if (order.vehicleId) {
            const veh = await vehicle.findOne({ where: { id: order.vehicleId, active: true } });
            if (veh) {
                const newStatus = (order.status === 'released' || order.status === 'closed') ? 'available' : 'maintenance';
                const oldStatus = veh.status;
                await veh.update({ status: newStatus });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'vehicle',
                        entityId: veh.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: newStatus },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        return order;
    }

    async update(id, data) {
        const loggedUser = this.getLoggedUser();

        if (data.vehicleId) {
            const vehExists = await vehicle.findOne({ where: { id: data.vehicleId, active: true } });
            if (!vehExists) {
                throw new entityErrors.EntityNotFoundError(
                    i18n.__('entity not found', 'Vehicle'),
                );
            }
        }

        // Leer el estado anterior antes de actualizar
        const orderDbBefore = await this._readById(id);
        const prevStatus = orderDbBefore.status;

        const updated = await super.update(id, data);

        const orderDb = await this._readById(id);

        if (
            orderDb.vehicleId &&
            data.status &&
            data.status === 'released' &&
            prevStatus !== data.status
        ) {
            const veh = await vehicle.findOne({ where: { id: orderDb.vehicleId, active: true } });
            if (veh) {
                const newStatus = 'available';
                const oldStatus = veh.status;
                await veh.update({ status: newStatus });
                if (services.auditlogService) {
                    await services.auditlogService.createLog({
                        entityName: 'vehicle',
                        entityId: veh.id,
                        action: 'update',
                        oldData: { status: oldStatus },
                        newData: { status: newStatus },
                        userId: loggedUser.id,
                        username: loggedUser.username,
                        companyId: loggedUser.company.id,
                    });
                }
            }
        }

        return updated;
    }

    generarFolio() {
        const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const id = crypto.randomUUID().slice(0, 6);
        return `#OS-${fecha}-${id}`;
    }
}

module.exports = new ServiceOrdenService();
