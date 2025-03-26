const { user, role } = models;
const { CRUDController, entityErrors } = helpers;

class UserController extends CRUDController {
    constructor() {
        super(user);
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
        this.addRelation(role, ["name"]);
    }
}
module.exports = new UserController();
