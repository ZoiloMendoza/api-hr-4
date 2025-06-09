const { auditlog } = models;
const { CRUDService } = helpers;

class AuditlogService extends CRUDService {
    constructor() {
        super(auditlog);
    }

    async createLog({ entityName, entityId, action, oldData, newData, userId }) {
        return await this.model.create({
            entityName,
            entityId,
            action,
            oldData,
            newData,
            userId,
        });
    }
}

module.exports = new AuditlogService();
