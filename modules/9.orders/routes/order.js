const { order, client } = models;
const { CRUDController, entityErrors, SearchResult } = helpers;

class OrdersController extends CRUDController {
    constructor() {
        super(order);
        this.addRelation(client, ['id']);
        this.addRoute('get', '/filter-by-route/:routeId/orders', async (req, res) => {
            const { routeId } = req.params;
            let filter = null;
            try {
                filter = this.parser.parse(req.query);
            } catch (error) {
                return res.status(400).json(req.__('Invalid query'));
            }
            try {
                const { rows, count } = await this.service.getOrdersForRoute(routeId, filter);
                return res.json(new SearchResult(rows, filter.start + 1, filter.limit, count));
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                if (error instanceof entityErrors.GenericError) {
                    return res.status(400).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new OrdersController();

module.exports = myself.getApp();
