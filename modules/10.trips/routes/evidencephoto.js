const { evidencephoto, evidence } = models;
const { CRUDController, entityErrors, routeMatcher } = helpers;
const multer = require('multer');

const upload = multer({
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('Solo se permiten imÃ¡genes'), false);
        }
        cb(null, true);
    },
});

class EvidencephotosController extends CRUDController {
    constructor() {
        super(evidencephoto);
        this.addRelation(evidence, ['id']);
        const validateUpload = this.validator.routes.post['/evidencephoto/upload'];
        const handler = async (req, res) => {
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
        };
        this.app.post('/evidencephoto/upload', upload.single('file'), validateUpload, handler);
        routeMatcher.addPath('post/evidencephoto/upload', {
            middlewares: [upload.single('file'), validateUpload],
            handler,
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
