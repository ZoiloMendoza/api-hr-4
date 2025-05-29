const { evidence, evidencephoto } = models;
const { CRUDController } = helpers;

class EvidencesController extends CRUDController {
    constructor() {
        super(evidence);
        this.addRelation(evidencephoto, ['id']);
        this.addRoute('post', '/evidence/full', async (req, res) => {
            logger.info('Creating evidence with photos');
            try {
                const created = await this.service.createEvidenceWithPhotos(req.input);
                return res.status(201).json(created);
            } catch (error) {
                res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new EvidencesController();

module.exports = myself.getApp();
