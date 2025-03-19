const { User, Role } = models;
const { CRUDController, entityErrors } = helpers;

class UserController extends CRUDController {
    constructor() {
        super(User);
        this.addRoute('put', '/user/:id/password', async (req, res) => {
            logger.info(`Updating password for user ${req.params.id}`);
            try {
                const newEntity = await this.service.changePassword(
                    req.params.id,
                    req.input.password,
                );
                return res.json(newEntity);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
        this.addRelation(Role, ["name"]);
        
        /*
        this.addRoute('put', '/user/:id/roles', async (req, res) => {
            logger.info(`Adding roles to user ${req.params.id}`);
            const id = req.params.id;
            try {
                const user = await this.service.assignRole(id, req.input.roles);
                return res.json(user);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                if (error instanceof entityErrors.entityErrors.UnauthorizedError) {
                    return res.status(401).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
        this.addRoute('delete', '/user/:id/roles', async (req, res) => {
            logger.info(`Deleting roles from user ${req.params.id}`);
            const id = req.params.id;
            try {
                const user = await this.service.removeRole(id, req.input.roles);
                return res.json(user);
            } catch (error) {
                res.status(500).json([error.message]);
            }
        });
        */
    }
}
module.exports = new UserController();
