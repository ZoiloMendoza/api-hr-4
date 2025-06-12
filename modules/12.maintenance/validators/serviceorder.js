const { serviceorder } = models;
const { CRUDValidator } = helpers;

class ServiceOrderValidator extends CRUDValidator {
    constructor() {
        super(serviceorder);

        const sparePartSchema = validators.sparepart.schema;

        this.addSchema('post', '/serviceorder/:id/sparepart', sparePartSchema);
        this.addSchema('put', '/serviceorder/:id/sparepart/:sparepartId', sparePartSchema);
        this.routes.delete['/serviceorder/:id/sparepart/:sparepartId'] = false;
        this.routes.get['/serviceorder/:id/spareparts'] = false;
    }
}

module.exports = new ServiceOrderValidator();
