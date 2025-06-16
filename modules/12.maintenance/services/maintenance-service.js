'use strict';

const { maintenance, vehicle, serviceorder } = models;
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

        const lastOrder = maintenanceDb.services.reduce((max, service) => {
            return service.order > max ? service.order : max;
        }, -Infinity);

        newService.refId = crypto.randomBytes(8).toString('hex');
        newService.order = lastOrder === -Infinity ? 1 : lastOrder + 1;

        maintenanceDb.services.push(newService);

        await this.update(maintenanceId, maintenanceDb);

        return {
            ...newService,
            id: newService.refId,
        };
    }

    async getMaintenanceServiceById(maintenanceId, serviceId) {
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
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Servicio'),
            );
        }

        return {
            ...maintenanceDb.services[serviceIndex],
            id: serviceId,
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
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Servicio'),
            );
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
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Mantenimiento'),
            );
        }

        if (!maintenanceDb.service) {
            maintenanceDb.service = [];
        }

        const serviceIndex = maintenanceDb.services.findIndex(
            (service) => service.refId === serviceId,
        );

        if (serviceIndex === -1) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Servicio'),
            );
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
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Mantenimiento'),
            );
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

    async getUpcomingMaintenances() {
        const loggedUser = this.getLoggedUser();

        const maintenanceDB = await maintenance.findOne({
            where: { name: 'preventivo', active: true },
        });

        const services = maintenanceDB.services;

        if (!maintenanceDB || services.length === 0) {
            throw new entityErrors.GenericError(
                i18n.__(
                    'No existen servicios de mantenimiento de tipo preventivo',
                ),
            );
        }

        const whereM = { active: true };
        if (vehicle.rawAttributes.companyId) {
            whereM.companyId = loggedUser.company.id;
        }

        const vehiclesDB = await vehicle.findAll({
            where: whereM,
            include: [
                {
                    model: serviceorder,
                    as: 'serviceorders',
                    limit: 1,
                    order: [['id', 'DESC']],
                },
            ],
        });

        const upcomingMaintenance = vehiclesDB.map((vehicle) => {
            return this.calculateUpcomingMaintenance(vehicle, services);
        });

        return upcomingMaintenance;
    }

    async getUpcomingMaintenance(vehicleId) {
        const loggedUser = this.getLoggedUser();
        const whereM = { active: true, id: vehicleId};

        if (vehicle.rawAttributes.companyId) {
            whereM.companyId = loggedUser.company.id;
        }

        const vehicleDb = await vehicle.findOne({
            where: whereM,
            include: [
                {
                    model: serviceorder,
                    as: 'serviceorders',
                    limit: 1,
                    order: [['id', 'DESC']],
                },
            ],
        });

        if (!vehicleId) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Vehicle'),
            );
        }

        const maintenanceDB = await maintenance.findOne({
            where: { name: 'preventivo', active: true },
        });

        if (!maintenanceDB || maintenanceDB.services.length === 0) {
            throw new entityErrors.GenericError(
                i18n.__(
                    'No existen servicios de mantenimiento de tipo preventivo',
                ),
            );
        }

        const services = maintenanceDB.services;

        return this.calculateUpcomingMaintenance(vehicleDb, services);
    }

    calculateUpcomingMaintenance(vehicle, services) {
        const vehicleCopy = {
            status:vehicle.status,
            licensePlate: vehicle.licensePlate,
            mileage: vehicle.mileage,
            operatorId: vehicle.operatorId,
            efficiencyKmPerLiter: vehicle.efficiencyKmPerLiter,
            vehicleYear: vehicle.vehicleYear,
            vehicleDescription: vehicle.vehicleDescription,
            averageKmPerDay: vehicle.averageKmPerDay,
        };
        const serviceorders = vehicle.serviceorders
        services.sort((a, b) => a.order - b.order);

        // en el caso de que el vehiculo no tenga registrado su km promedio por dia
        if (!vehicle.averageKmPerDay || vehicle.averageKmPerDay <= 0) {
        
            let lastServiceOrderId = "No cuenta con ningun Mtto. anterior";
            let lastServiceRefId = "Servicio anterior eliminado";
            let lastServiceDate = null;
            let lastVehicleKm = null;
            let nextService = services[0];
        
            if(serviceorders.length > 0){
                lastServiceOrderId = serviceorders[0].id;
                lastServiceDate = serviceorders[0].createdAt;
                lastVehicleKm = serviceorders[0].vehicleMileage;
                const lastService =  this.getServiceById(serviceorders[0].serviceRefId, services);

                if(lastService){
                    nextService = this.calculateNextService(lastService, services);
                    lastServiceRefId = lastService.refId;
                }
            }

            return {
                vehicleId: vehicle.id,
                vehicle: vehicleCopy,
                lastServiceOrderId,
                lastServiceRefId,
                lastServiceDate,
                lastVehicleKm,
                averageKmPerDay: "Falta los KM promedio por día",
                nextServiceRefId: nextService.refId,
                nextServiceName: nextService.name,
                estimatedDate: new Date()
            };
        }

        // si es la primera ves que realizan el mantenimiento de la unidad
        if (serviceorders.length === 0) {
            return {
                vehicleId: vehicle.id,
                vehicle: vehicleCopy,
                lastServiceOrderId: "No cuenta con ningun Mtto. anterior",
                lastServiceRefId: null,
                lastServiceDate: null,
                lastVehicleKm: null,
                averageKmPerDay: vehicle.averageKmPerDay,
                nextServiceRefId: services[0].refId,
                nextService: services[0].name,
                estimatedDate: new Date()
            };
        }

        const lastService = this.getServiceById(serviceorders[0].serviceRefId, services);
        
        if (!lastService) {
            return {
                vehicleId: vehicle.id,
                vehicle: vehicleCopy,
                lastServiceOrderId: serviceorders[0].id,
                lastServiceRefId: null,
                lastServiceDate: null,
                lastVehicleKm: null,
                averageKmPerDay: vehicle.averageKmPerDay,
                nextServiceRefId: services[0].refId,
                nextService: services[0].name,
                estimatedDate: new Date()
            };
        }

        const nextService = this.calculateNextService(lastService, services);
        const frequencyDays = nextService.frequencyKm / vehicle.averageKmPerDay;
        const lastServiceDate = new Date(serviceorders[0].createdAt);
        const nextServiceDate = new Date(lastServiceDate);
        nextServiceDate.setDate(nextServiceDate.getDate() + frequencyDays);
        
        return {
            vehicleId: vehicle.id,
            vehicle: vehicleCopy,
            lastServiceOrderId: serviceorders[0].id,
            lastServiceRefId: lastService.refId,
            lastServiceDate: lastServiceDate,
            lastVehicleKm: serviceorders[0].vehicleMileage,
            averageKmPerDay: vehicle.averageKmPerDay,
            nextServiceRefId: nextService.refId,
            nextService: nextService.name,
            estimatedDate: nextServiceDate,
        };
    }

    calculateNextService(lastService, services){
        let nextService = services.find((service) => service.order > lastService.order);
        if (!nextService) nextService = services[0];
        return nextService;
    }

    getServiceById(refId, services){
        return services.find((service) => service.refId === refId);
    }
}

module.exports = new MaintenanceService();
