'use strict';


const { serviceorder } = models;
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
        const total = newSparePart.cost*newSparePart.quantity;
        serviceOrdenDb.total =  (parseFloat(serviceOrdenDb.total) + total);

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
        
        if(lastTotal !== newTotal){
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
        const total = deletedSparePart.cost*deletedSparePart.quantity;
        serviceOrdenDb.total =  (parseFloat(serviceOrdenDb.total) - total);

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

    async create(data, confirm = false, replace = false){
        data.folio = this.generarFolio();
        return super.create(data, confirm, replace)
    }

    generarFolio() {
        const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const id = crypto.randomUUID().slice(0, 6);
        return `#OS-${fecha}-${id}`;
    }
}

module.exports = new ServiceOrdenService();
