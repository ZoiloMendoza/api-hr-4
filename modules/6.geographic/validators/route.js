const { CRUDValidator } = helpers;
const { route } = models;

class RouteValidator extends CRUDValidator {}

module.exports = new RouteValidator(route);
