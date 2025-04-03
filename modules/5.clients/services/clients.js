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

    async getClientAddresses(clientId) {
        const clientDb = await this.readById(clientId);
        if (!clientDb) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Cliente'),
            );
        }
        return clientDb.addresses;
    }
}

module.exports = new ClientService();
