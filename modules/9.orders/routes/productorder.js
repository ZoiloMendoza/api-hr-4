const { productorder } = models;
const { CRUDController } = helpers;

class ProductordersController extends CRUDController {
    constructor() {
        super(productorder);
    }
}

const myself = new ProductordersController();

module.exports = myself.getApp();
