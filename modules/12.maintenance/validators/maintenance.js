const { maintenance } = models;
const { CRUDValidator } = helpers;

class MaintenanceValidator extends CRUDValidator {
    constructor() {
        super(maintenance);

        const serviceSchema = validators.service.schema;

        this.addSchema('post', '/maintenance/:id/service', serviceSchema);
        this.addSchema('put', '/maintenance/:id/service/:serviceId', serviceSchema);
        this.routes.delete['/maintenance/:id/service/:serviceId'] = false;
        this.routes.get['/maintenance/:id/services'] = false;
    }
}

module.exports = new MaintenanceValidator();
