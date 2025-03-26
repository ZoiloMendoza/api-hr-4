const { client } = models;
const { CRUDController } = helpers;

class ClientController extends CRUDController {
    constructor() {
        super(client);
    }
}

module.exports = new ClientController();