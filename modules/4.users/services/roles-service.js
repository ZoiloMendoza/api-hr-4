const { role } = models;

const { CRUDService } = helpers;

class RolesService extends CRUDService {
    constructor() {
        super(role);
    }
}

module.exports = new RolesService();
