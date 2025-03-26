const { CRUDValidator }  = helpers;
const { role } = models;

class RoleValidator extends CRUDValidator {
    
}

module.exports = new RoleValidator(role);