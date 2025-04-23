const { CRUDValidator } = helpers;
const { employee } = models;

class EmployeeValidator extends CRUDValidator {}

module.exports = new EmployeeValidator(employee);
