const { evidencephoto, evidence } = models;
const { CRUDController, entityErrors } = helpers;
const multer = require('multer');

class EvidencephotosController extends CRUDController {
    constructor() {
        super(evidencephoto);
        this.addRelation(evidence, ['id']); const upload = multer();
        this.addRoute('post', '/evidencephoto/upload', upload.single('file'), async (req, res) => {
            try {
                const { evidenceId, description, actionRefId } = req.input;
                const file = req.file || (req.files && req.files.file);
                const created = await this.service.uploadEvidencePhoto(
                    file.buffer,
                    { evidenceId, description, actionRefId },
                );
                return res.status(201).json(created);
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(409).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new EvidencephotosController();

module.exports = myself.getApp();
