const { CRUDValidator }  = helpers;
const { Role } = models;

class RoleValidator extends CRUDValidator {
    
}

module.exports = new RoleValidator(Role);