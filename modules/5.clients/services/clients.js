'use strict';
const { client } = models;
const { CRUDService } = helpers;

class ClientService extends CRUDService {
    constructor() {
        super(client);
    }
}

module.exports = new ClientService();