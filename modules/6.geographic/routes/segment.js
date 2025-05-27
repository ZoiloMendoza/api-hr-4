const { segment } = models;
const { CRUDController, entityErrors } = helpers;

class SegmentsController extends CRUDController {
    constructor() {
        super(segment);
        this.addRoute('post', '/calculate-segment', async (req, res) => {
            logger.info('Calculando ruta');
            try {
                const { optimalRoute, tollRoute, freeRoute, originId, destinationId, isFirst, segmentId } = req.input;
                const response = await this.service.calculateSegment(
                    optimalRoute,
                    tollRoute,
                    freeRoute,
                    originId,
                    destinationId,
                    isFirst,
                    segmentId,
                );
                res.json(response);
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(410).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new SegmentsController();

module.exports = myself.getApp();
