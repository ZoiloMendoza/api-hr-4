const { productorder, catalog } = models;
const { CRUDController } = helpers;

class ProductordersController extends CRUDController {
    constructor() {
        super(productorder);
        this.addRelation(catalog, ['id']);
    }
}

const myself = new ProductordersController();

module.exports = myself.getApp();
