const { Client } = models;
const { CRUDController } = helpers;

class ClientController extends CRUDController {
    constructor() {
        super(Client);
    }
}

module.exports = new ClientController();