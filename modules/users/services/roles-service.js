const { Role } = models;

const { CRUDService } = helpers;

class RolesService extends CRUDService {
    constructor() {
        super(Role);
    }
}

module.exports = new RolesService();
