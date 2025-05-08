const { CRUDValidator } = helpers;
const { employeetype } = models;

class EmployeetypeValidator extends CRUDValidator {}

module.exports = new EmployeetypeValidator(employeetype);
