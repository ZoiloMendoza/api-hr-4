const { serviceorder, maintenance} = models;
const { CRUDController, entityErrors, SearchResult } = helpers;

class MaintenanceController extends CRUDController {
    constructor() {
        super(serviceorder);
        this.addRelation(maintenance, ['id']);

        this.addRoute('post', '/serviceorder/:id/sparepart', async (req, res) => {
            logger.info(`Adding a new spare part for service order ${req.params.id}`);
            try {
                const newSparePart = await this.service.addServiceOrdenSparePart(
                    req.params.id,
                    req.input,
                );
                return res.status(201).json(newSparePart);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute('put', '/serviceorder/:id/sparepart/:sparepartId',
            async (req, res) => {
                logger.info(
                    `Updating sparepart ${req.params.serviceId} for serviceorder ${req.params.id}`,
                );
                try {
                    const updateSparePart =
                        await this.service.updateServiceOrderSparePartById(
                            req.params.id,
                            req.params.sparepartId,
                            req.input,
                        );
                    return res.json(updateSparePart);
                } catch (error) {
                    if (error instanceof entityErrors.EntityNotFoundError) {
                        return res.status(404).json([error.message]);
                    }
                    return res.status(500).json([error.message]);
                }
            },
        );

        this.addRoute('delete','/serviceorder/:id/sparepart/:sparepartId',
            async (req, res) => {
                logger.info(
                    `Deleting sparepart ${req.params.serviceId} for serviceorder ${req.params.id}`,
                );
                try {
                    const deletedSparePart =
                        await this.service.deleteServiceOrdenSparePartById(
                            req.params.id,
                            req.params.sparepartId,
                        );
                    return res.json(deletedSparePart);
                } catch (error) {
                    if (error instanceof entityErrors.EntityNotFoundError) {
                        return res.status(404).json([error.message]);
                    }
                    return res.status(500).json([error.message]);
                }
            },
        );

        this.addRoute('get', '/serviceorder/:id/spareparts', async (req, res) => {
            logger.info(`Getting sparepart for serviceorder ${req.params.id}`);

            delete req.query.start;
            delete req.query.limit;

            try {
                const spareParts = await this.service.getServiceOrdenSpareParts(
                    req.params.id,
                );
                res.json(
                    new SearchResult(
                        spareParts,
                        1,
                        spareParts.length,
                        spareParts.length,
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
