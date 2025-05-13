const { employee, operator } = models;
const { CRUDController, SearchResult, entityErrors } = helpers;

class EmployeesController extends CRUDController {
    constructor() {
        super(employee);
        this.addRelation(operator, ['id'], 'employeeId');
        this.addRoute('post', '/employee/:id/address', async (req, res) => {
            logger.info(`Adding a new address for employee ${req.params.id}`);
            try {
                //Añade una dirección
                const newAddress = await this.service.addEmployeeAddress(req.params.id, req.input);
                return res.status(201).json(newAddress);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute('put', '/employee/:id/address/:addressId', async (req, res) => {
            logger.info(`Updating address ${req.params.addressId} for employee ${req.params.id}`);
            try {
                //Actualiza una dirección
                const updateAddress = await this.service.updateEmployeeAddressById(
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
        });

        this.addRoute('delete', '/employee/:id/address/:addressId', async (req, res) => {
            logger.info(`Deleting address ${req.params.addressId} for employee ${req.params.id}`);
            try {
                //Elimina una dirección
                const deletedAddress = await this.service.deleteEmployeeAddressById(
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
        });

        this.addRoute('get', '/employee/:id/addresses', async (req, res) => {
            logger.info(`Getting addresses for employee ${req.params.id}`);

            delete req.query.start;
            delete req.query.limit;

            try {
                //Listar todas las direcciones
                const addresses = await this.service.getEmployeeAddresses(req.params.id);
                res.json(new SearchResult(addresses, 1, addresses.length, addresses.length));
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new EmployeesController();

module.exports = myself.getApp();
