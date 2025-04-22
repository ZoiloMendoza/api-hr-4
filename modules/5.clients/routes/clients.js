const { client } = models;
const { CRUDController, entityErrors, SearchResult } = helpers;

class ClientController extends CRUDController {
    constructor() {
        super(client);
        this.addRoute('put', '/client/:id/addresses', async (req, res) => {
            logger.info(`Updating addresses for client ${req.params.id}`);
            try {
                //Remplaza todo el array de direcciones
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

        this.addRoute('post', '/client/:id/address', async (req, res) => {
            logger.info(`Adding a new address for client ${req.params.id}`);
            try {
                //Añade una dirección
                const newAddress = await this.service.addClientAddress(
                    req.params.id,
                    req.input,
                );
                return res.status(201).json(newAddress);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute(
            'put',
            '/client/:id/address/:addressId',
            async (req, res) => {
                logger.info(
                    `Updating address ${req.params.addressId} for client ${req.params.id}`,
                );
                try {
                    //Actualiza una dirección
                    const updateAddress =
                        await this.service.updateClientAddressById(
                            req.params.id,
                            req.params.addressId,
                            req.input,
                        );
                    return res.json(updateAddress);
                } catch (error) {
                    if (error instanceof entityErrors.EntityNotFoundError) {
                        return res.status(404).json([error.message]);
                    }
                    return res.status(500).json([error.message]);
                }
            },
        );

        this.addRoute(
            'delete',
            '/client/:id/address/:addressId',
            async (req, res) => {
                logger.info(
                    `Deleting address ${req.params.addressId} for client ${req.params.id}`,
                );
                try {
                    //Elimina una dirección
                    const deletedAddress =
                        await this.service.deleteClientAddressById(
                            req.params.id,
                            req.params.addressId,
                        );
                    return res.json(deletedAddress);
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

            delete req.query.start;
            delete req.query.limit;

            try {
                //Listar todas las direcciones de un cliente
                const addresses = await this.service.getClientAddresses(
                    req.params.id,
                );
                res.json(
                    new SearchResult(
                        addresses,
                        1,
                        addresses.length,
                        addresses.length,
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

module.exports = new ClientController();
