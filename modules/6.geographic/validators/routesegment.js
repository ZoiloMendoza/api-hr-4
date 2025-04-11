const { CRUDValidator } = helpers;
const { routesegment } = models;

class RoutesegmentValidator extends CRUDValidator {}

module.exports = new RoutesegmentValidator(routesegment);
