const { operator } = models;
const { CRUDService } = helpers;

class OperatorsService extends CRUDService {
    constructor() {
        super(operator);
    }
}
module.exports = new OperatorsService();
