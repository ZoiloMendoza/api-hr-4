const { paymenttype } = models;
const { CRUDService } = helpers;

class PaymenttypesService extends CRUDService {
    constructor() {
        super(paymenttype);
    }
}
module.exports = new PaymenttypesService();
