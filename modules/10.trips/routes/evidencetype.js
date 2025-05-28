const { evidencetype } = models;
const { CRUDController, SearchResult, entityErrors } = helpers;

class EvidencetypesController extends CRUDController {
    constructor() {
        super(evidencetype);

        this.addRoute('post', '/evidencetype/:id/action', async (req, res) => {
            logger.info(`Adding a new action for evidence type ${req.params.id}`);
            try {
                // Añade una acción
                const newAction = await this.service.addEvidenceTypeAction(req.params.id, req.input);
                return res.status(201).json(newAction);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute('put', '/evidencetype/:id/action/:actionRefId', async (req, res) => {
            logger.info(`Updating action ${req.params.actionRefId} for evidence type ${req.params.id}`);
            try {
                // Actualiza una acción
                const updatedAction = await this.service.updateEvidenceTypeActionByRefId(
                    req.params.id,
                    req.params.actionRefId,
                    req.input,
                );
                return res.json(updatedAction);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute('delete', '/evidencetype/:id/action/:actionRefId', async (req, res) => {
            logger.info(`Deleting action ${req.params.actionRefId} for evidence type ${req.params.id}`);
            try {
                // Elimina una acción
                const deletedAction = await this.service.deleteEvidenceTypeActionByRefId(
                    req.params.id,
                    req.params.actionRefId,
                );
                return res.json(deletedAction);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute('get', '/evidencetype/:id/actions', async (req, res) => {
            logger.info(`Getting actions for evidence type ${req.params.id}`);

            delete req.query.start;
            delete req.query.limit;

            try {
                // Listar todas las acciones
                const actions = await this.service.getEvidenceTypeActions(req.params.id);
                res.json(new SearchResult(actions, 1, actions.length, actions.length));
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new EvidencetypesController();

module.exports = myself.getApp();
