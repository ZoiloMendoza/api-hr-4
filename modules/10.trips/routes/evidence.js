const { evidence, evidencephoto, evidencetype } = models;
const { CRUDController, SearchResult, entityErrors } = helpers;

class EvidencesController extends CRUDController {
    constructor() {
        super(evidence);
        this.addRelation(evidencephoto, ['id']);
        this.addRelation(evidencetype, ['id']);
        this.addRoute('post', '/evidence/full', async (req, res) => {
            logger.info('Creating evidence with photos');
            try {
                const created = await this.service.createEvidenceWithPhotos(req.input);
                return res.status(201).json(created);
            } catch (error) {
                res.status(500).json([error.message]);
            }
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
