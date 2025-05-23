const { vehicle, operator } = models;
const { CRUDController, entityErrors, SearchResult } = helpers;

class VehiclesController extends CRUDController {
    constructor() {
        super(vehicle);
        this.addRelation(operator, ['id']);
        this.addRoute('get', '/vehicles/available-with-operators', async (req, res) => {
            logger.info('Fetching vehicles with operators and employees');
            let filter = null;
            try {
                filter = this.parser.parse(req.query);
            } catch (error) {
                return res.status(400).json(req.__('Invalid query'));
            }

            try {
                const { rows, count } = await this.service.getVehiclesWithOperatorsAndEmployees(filter);

                return res.json(new SearchResult(rows, filter.start + 1, filter.limit, count));
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                if (error instanceof entityErrors.UnauthorizedError) {
                    return res.status(401).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
        this.addRoute('get', '/vehicles/available-with-operators/:vehicleId', async (req, res) => {
            const { vehicleId } = req.params;

            try {
                const vehicle = await this.service.getVehicleWithOperatorsAndEmployeesById(vehicleId);
                return res.json(vehicle);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new VehiclesController();

module.exports = myself.getApp();
