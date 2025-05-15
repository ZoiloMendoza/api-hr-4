const { productorder } = models;
const { CRUDService } = helpers;

class ProductordersService extends CRUDService {
    constructor() {
        super(productorder);
    }
}

module.exports = new ProductordersService();
