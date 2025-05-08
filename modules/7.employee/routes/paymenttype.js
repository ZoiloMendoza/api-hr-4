const { paymenttype } = models;
const { CRUDController } = helpers;

class PaymenttypesController extends CRUDController {
    constructor() {
        super(paymenttype);
    }
}

const myself = new PaymenttypesController();

module.exports = myself.getApp();
