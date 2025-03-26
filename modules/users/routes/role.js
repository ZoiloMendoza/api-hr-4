const { role } = models;   

const { CRUDController } = helpers;

class RoleController extends CRUDController {
    constructor(model) {
        super(model, process.env.SYSADMIN_ROLE);
    }
}

const myself = new RoleController(role);

module.exports = myself.getApp();