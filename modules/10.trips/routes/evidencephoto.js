const { evidencephoto, evidence } = models;
const { CRUDController, entityErrors } = helpers;
const multer = require('multer');

class EvidencephotosController extends CRUDController {
    constructor() {
        super(evidencephoto);
        this.addRelation(evidence, ['id']);
        const upload = multer();
        this.addRoute('post', '/evidencephoto/upload', async (req, res) => {
            upload.single('file')(req, res, async (err) => {
                if (err) return res.status(400).json([err.message]);
                try {
                    const { evidenceId, description, actionRefId } = req.input;
                    const file = req.file;
                    const created = await this.service.uploadEvidencePhoto(file.buffer, {
                        evidenceId,
                        description,
                        actionRefId,
                    });
                    return res.status(201).json(created);
                } catch (error) {
                    if (error instanceof entityErrors.GenericError) {
                        return res.status(409).json([error.message]);
                    }
                    res.status(500).json([error.message]);
                }
            });
        });

        this.addRoute('delete', '/evidencephoto/:id/image', async (req, res) => {
            logger.info(`Deleting evidencephoto ${req.params.id} with image`);
            try {
                const deleted = await this.service.deleteEvidencePhoto(req.params.id);
                return res.json(deleted);
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new EvidencephotosController();

module.exports = myself.getApp();
