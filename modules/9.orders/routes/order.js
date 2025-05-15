const { order, client } = models;
const { CRUDController } = helpers;

class OrdersController extends CRUDController {
    constructor() {
        super(order);
        this.addRelation(client, ['id']);
    }
}

const myself = new OrdersController();

module.exports = myself.getApp();
