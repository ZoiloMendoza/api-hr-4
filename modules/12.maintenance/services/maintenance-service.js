'use strict';

const { maintenance } = models;
const { CRUDService, entityErrors } = helpers;
const crypto = require('crypto');

class MaintenanceService extends CRUDService {
    constructor() {
        super(maintenance);
    }

    async addMaintenanceService(maintenanceId, newService) {
        const maintenanceDb = await this.readById(maintenanceId);
        if (!maintenanceDb) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Mantenimiento'),
            );
        }

        if (!maintenanceDb.services) {
            maintenanceDb.services = [];
        }
        newService.refId = crypto.randomBytes(8).toString('hex');
        maintenanceDb.services.push(newService);

        await this.update(maintenanceId, maintenanceDb);

        return {
            ...newService,
            id: newService.refId,
        };
    }

    async updateMaintenanceServiceById(maintenanceId, serviceId, updatedService) {
        const maintenanceDb = await this.readById(maintenanceId);
        if (!maintenanceDb) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Mantenimiento'),
            );
        }

        if (!maintenanceDb.services) {
            maintenanceDb.services = [];
        }

        const serviceIndex = maintenanceDb.services.findIndex((service) => service.refId === serviceId);

        if (serviceIndex === -1) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Servicio'));
        }

        maintenanceDb.services[serviceIndex] = {
            ...maintenanceDb.services[serviceIndex],
            ...updatedService,
        };

        await this.update(maintenanceId, maintenanceDb);

        return {
            ...maintenanceDb.services[serviceIndex],
            id: serviceId,
        };
    }

    
    async deleteMaintenanceServiceById(maintenanceId, serviceId) {
        const maintenanceDb = await this.readById(maintenanceId);
        if (!maintenanceDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Mantenimiento'));
        }

        if (!maintenanceDb.service) {
            maintenanceDb.service = [];
        }

        const serviceIndex = maintenanceDb.services.findIndex((service) => service.refId === serviceId);

        if (serviceIndex === -1) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Servicio'));
        }

        const deletedService = maintenanceDb.services[serviceIndex];

        maintenanceDb.services.splice(serviceIndex, 1);

        await this.update(maintenanceId, maintenanceDb);

        return {
            ...deletedService,
            id: serviceId,
        };
    }

    async getMaintenanceService(maintenanceId) {
        const maintenanceDb = await this.readById(maintenanceId);
        if (!maintenanceDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Mantenimiento'));
        }

        if (!maintenanceDb.services) {
            maintenanceDb.services = [];
        }

        return maintenanceDb.services.map((service) => ({
            ...service,
            id: service.refId,
            maintenanceId: maintenanceId,
        }));
    }
}

module.exports = new MaintenanceService();
