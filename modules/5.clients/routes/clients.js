const { client } = models;
const { CRUDController, entityErrors } = helpers;

class ClientController extends CRUDController {
    constructor() {
        super(client);
        this.addRoute('put', '/client/:id/addresses', async (req, res) => {
            logger.info(`Updating addresses for client ${req.params.id}`);
            try {
                const newEntity = await this.service.updateClientAddresses(
                    req.params.id,
                    req.input.addresses,
                );
                return res.json(newEntity);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute(
            'put',
            '/client/:id/addresse/:addressId',
            async (req, res) => {
                logger.info(
                    `Updating address ${req.params.addressId} for client ${req.params.id}`,
                );
                try {
                    const newEntity =
                        await this.service.updateClientAddressById(
                            req.params.id,
                            req.params.addressId,
                            req.input,
                        );
                    return res.json(newEntity);
                } catch (error) {
                    if (error instanceof entityErrors.EntityNotFoundError) {
                        return res.status(404).json([error.message]);
                    }
                    return res.status(500).json([error.message]);
                }
            },
        );

        this.addRoute('get', '/client/:id/addresses', async (req, res) => {
            logger.info(`Getting addresses for client ${req.params.id}`);
            try {
                const addresses = await this.service.getClientAddresses(
                    req.params.id,
                );
                return res.json(addresses);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
    }
}

module.exports = new ClientController();
