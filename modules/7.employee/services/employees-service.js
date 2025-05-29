'use strict';
const { employee } = models;
const { CRUDService, entityErrors } = helpers;

class EmployeesService extends CRUDService {
    constructor() {
        super(employee);
    }

    async updateEmployeeAddressById(employeeId, addressId, updatedAddress) {
        const employeeDb = await this.readById(employeeId);
        if (!employeeDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Empleado'));
        }

        if (!employeeDb.addresses) {
            employeeDb.addresses = [];
        }

        const addressesWithIds = employeeDb.addresses.map((address, index) => ({
            ...address,
            id: index + 1,
        }));

        const addressIndex = addressesWithIds.findIndex((address) => address.id === Number(addressId));

        if (addressIndex === -1) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Dirección'));
        }

        addressesWithIds[addressIndex] = {
            ...addressesWithIds[addressIndex],
            ...updatedAddress,
        };

        employeeDb.addresses = addressesWithIds.map(({ id, ...address }) => address);

        await this.update(employeeId, employeeDb);

        return addressesWithIds[addressIndex];
    }

    async addEmployeeAddress(employeeId, newAddress) {
        const employeeDb = await this.readById(employeeId);
        if (!employeeDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Empleado'));
        }

        if (!employeeDb.addresses) {
            employeeDb.addresses = [];
        }

        employeeDb.addresses.push(newAddress);

        await this.update(employeeId, employeeDb);

        return {
            ...newAddress,
            id: employeeDb.addresses.length,
        };
    }

    async deleteEmployeeAddressById(employeeId, addressId) {
        const employeeDb = await this.readById(employeeId);
        if (!employeeDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Empleado'));
        }

        if (!employeeDb.addresses) {
            employeeDb.addresses = [];
        }

        const addressesWithIds = employeeDb.addresses.map((address, index) => ({
            ...address,
            id: index + 1,
        }));

        const addressIndex = addressesWithIds.findIndex((address) => address.id === Number(addressId));

        if (addressIndex === -1) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Dirección'));
        }

        const deletedAddress = addressesWithIds[addressIndex];

        addressesWithIds.splice(addressIndex, 1);

        employeeDb.addresses = addressesWithIds.map(({ id, ...address }) => address);

        await this.update(employeeId, employeeDb);

        return deletedAddress;
    }

    async getEmployeeAddresses(employeeId) {
        const employeeDb = await this.readById(employeeId);
        if (!employeeDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Empleado'));
        }

        if (!employeeDb.addresses) {
            employeeDb.addresses = [];
        }

        return employeeDb.addresses.map((address, index) => {
            return {
                ...address,
                employeeId: employeeId,
                id: index + 1,
            };
        });
    }
}

module.exports = new EmployeesService();
