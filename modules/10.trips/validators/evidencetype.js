const { evidencetype } = models;
const { CRUDValidator } = helpers;

class EvidencetypeValidator extends CRUDValidator {
    constructor() {
        super(evidencetype);

        const actionSchema = validators.action.schema;

        this.addSchema('post', '/evidencetype/:id/action', actionSchema);
        this.addSchema('put', '/evidencetype/:id/action/:actionRefId', actionSchema);
        this.routes.get['/evidencetype/:id/actions'] = false;
        this.routes.delete['/evidencetype/:id/action/:actionRefId'] = false;
    }
}

module.exports = new EvidencetypeValidator();
