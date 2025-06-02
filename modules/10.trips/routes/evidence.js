const { evidence, evidencephoto, evidencetype } = models;
const { CRUDController, SearchResult, entityErrors, routeMatcher } = helpers;
const parseEvidencePhoto = require('../../../shared/middleware/parse-evidence-photo');
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
class EvidencesController extends CRUDController {
    constructor() {
        super(evidence);
        this.addRelation(evidencephoto, ['id']);
        this.addRelation(evidencetype, ['id']);
        const validateFull = this.validator.routes.post['/evidence/full'];
        const handler = async (req, res) => {
            logger.info('Creating evidence with photos');
            try {
                if (req.files && req.input.evidencePhoto) {
                    for (let i = 0; i < req.input.evidencePhoto.length && i < req.files.length; i++) {
                        req.input.evidencePhoto[i].imgFile = req.files[i].buffer;
                    }
                }
                const created = await this.service.createEvidenceWithPhotos(req.input);
                return res.status(201).json(created);
            } catch (error) {
                res.status(500).json([error.message]);
            }
        };

        this.app.post('/evidence/full', upload.array('files'), parseEvidencePhoto, validateFull, handler);

        routeMatcher.addPath('post/evidence/full', {
            middlewares: [upload.array('files'), parseEvidencePhoto, validateFull],
            handler,
        });

        this.addRoute('get', '/trip/:id/evidence-with-photo', async (req, res) => {
            const { id } = req.params;
            let filter = null;
            try {
                filter = this.parser.parse(req.query);
            } catch (error) {
                return res.status(400).json(req.__('Invalid query'));
            }
            try {
                const { rows, count } = await this.service.getTripEvidenceWithPhotos(id, filter);
                if (!rows.length) {
                    return res.status(404).json([req.__('No hay elementos relacionados')]);
                }
                return res.json(new SearchResult(rows, filter.start + 1, filter.limit, count));
            } catch (error) {
                if (error instanceof entityErrors.EntityNotFoundError) {
                    return res.status(404).json([error.message]);
                }
                return res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new EvidencesController();

module.exports = myself.getApp();
