const { maintenance } = models;
const { CRUDController, entityErrors, SearchResult } = helpers;

class MaintenanceController extends CRUDController {
    constructor() {
        super(maintenance);
        this.addRoute('post', '/maintenance/:id/service', async (req, res) => {
            logger.info(`Adding a new service for maintenance ${req.params.id}`);
            try {
                const newService = await this.service.addMaintenanceService(
                    req.params.id,
                    req.input,
                );
                return res.status(201).json(newService);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute('put', '/maintenance/:id/service/:serviceId',
            async (req, res) => {
                logger.info(
                    `Updating service ${req.params.serviceId} for maintenance ${req.params.id}`,
                );
                try {
                    const updateService =
                        await this.service.updateMaintenanceServiceById(
                            req.params.id,
                            req.params.serviceId,
                            req.input,
                        );
                    return res.json(updateService);
                } catch (error) {
                    if (error instanceof entityErrors.EntityNotFoundError) {
                        return res.status(404).json([error.message]);
                    }
                    return res.status(500).json([error.message]);
                }
            },
        );

        this.addRoute('delete','/maintenance/:id/service/:serviceId',
            async (req, res) => {
                logger.info(
                    `Deleting service ${req.params.serviceId} for maintenance ${req.params.id}`,
                );
                try {
                    //Elimina una dirección
                    const deletedService =
                        await this.service.deleteMaintenanceServiceById(
                            req.params.id,
                            req.params.serviceId,
                        );
                    return res.json(deletedService);
                } catch (error) {
                    if (error instanceof entityErrors.EntityNotFoundError) {
                        return res.status(404).json([error.message]);
                    }
                    return res.status(500).json([error.message]);
                }
            },
        );

        this.addRoute('get', '/maintenance/:id/services', async (req, res) => {
            logger.info(`Getting services for maintenance ${req.params.id}`);

            delete req.query.start;
            delete req.query.limit;

            try {
                const services = await this.service.getMaintenanceService(
                    req.params.id,
                );
                res.json(
                    new SearchResult(
                        services,
                        1,
                        services.length,
                        services.length,
                    ),
                );
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
    }
}

module.exports = new MaintenanceController();
