const { order } = models;
const { CRUDService } = helpers;

class OrdersService extends CRUDService {
    constructor() {
        super(order);
    }
}
module.exports = new OrdersService();
