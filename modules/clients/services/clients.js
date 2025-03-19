'use strict';
const { Client } = models;
const { CRUDService } = helpers;

class ClientService extends CRUDService {
    constructor() {
        super(Client);
    }
}

module.exports = new ClientService();