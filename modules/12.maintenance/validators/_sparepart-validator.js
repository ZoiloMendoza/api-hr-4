const { CRUDValidator } = helpers;
const { sparepart } = models;

class SparePartValidator extends CRUDValidator {
    constructor() {
        super(sparepart);
    }
}

module.exports = new SparePartValidator();
