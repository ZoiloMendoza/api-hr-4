const { route, segment } = models;
const { CRUDController, entityErrors } = helpers;

class RoutesController extends CRUDController {
    constructor() {
        super(route);
        this.addRelation(segment, ['id']);
        this.addRoute('post', '/route/full', async (req, res) => {
            logger.info('Creando una nueva ruta');
            try {
                const routeData = req.input;
                const createdRoute = await this.service.createRouteWithSegments(routeData);
                return res.status(201).json(createdRoute);
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(404).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });
    }
}

module.exports = new RoutesController();
