const { order } = models;
const { CRUDController } = helpers;

class OrdersController extends CRUDController {
    constructor() {
        super(order);
    }
}

const myself = new OrdersController();

module.exports = myself.getApp();
