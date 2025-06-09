const { auditlog } = models;
const { CRUDController } = helpers;

class AuditlogController extends CRUDController {
    constructor() {
        super(auditlog, process.env.SYSADMIN_ROLE);
    }

    configApp() {
        logger.info(`Configuring ${this.modelName} routes`);
        this.addGet();
        this.addGetOne();
    }
}

module.exports = new AuditlogController();
