'use strict';

const { client } = models;
const { CRUDService, entityErrors } = helpers;

class ClientService extends CRUDService {
    constructor() {
        super(client);
    }

    async updateClientAddresses(clientId, addresses) {
        const clientDb = await this.readById(clientId);
        if (!clientDb) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Cliente'),
            );
        }
        if (!clientDb.addresses) {
            clientDb.addresses = [];
        }
        clientDb.addresses = addresses.map((address) => {
            return {
                ...address,
                clientId: clientId,
            };
        });
        return this.update(clientId, clientDb);
    }

    async updateClientAddressById(clientId, addressId, updatedAddress) {
        const clientDb = await this.readById(clientId);
        if (!clientDb) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Cliente'),
            );
        }

        if (!clientDb.addresses) {
            clientDb.addresses = [];
        }

        const addressesWithIds = clientDb.addresses.map((address, index) => ({
            ...address,
            id: index + 1,
        }));

        const addressIndex = addressesWithIds.findIndex(
            (address) => address.id === Number(addressId),
        );

        if (addressIndex === -1) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Dirección'),
            );
        }

        addressesWithIds[addressIndex] = {
            ...addressesWithIds[addressIndex],
            ...updatedAddress,
        };

        clientDb.addresses = addressesWithIds.map(
            ({ id, ...address }) => address,
        );

        return this.update(clientId, clientDb);
    }

    async getClientAddresses(clientId) {
        const clientDb = await this.readById(clientId);
        if (!clientDb) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Cliente'),
            );
        }

        if (!clientDb.addresses) {
            clientDb.addresses = [];
        }

        return clientDb.addresses.map((address, index) => {
            return {
                ...address,
                clientId: clientId,
                id: index + 1,
            };
        });
    }
}

module.exports = new ClientService();
