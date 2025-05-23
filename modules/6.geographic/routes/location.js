const { location } = models;
const { CRUDController, entityErrors, SearchResult } = helpers;

class LocationsController extends CRUDController {
    constructor() {
        super(location);

        this.addRoute('put', '/location-inegi/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const response = await this.service.updateLocationWithINEGI(id, req.input);
                res.json(response);
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(409).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });

        this.addRoute('post', '/location-inegi-search', async (req, res) => {
            logger.info('Getting location by INEGI search');
            try {
                const { value } = req.input;
                const response = await this.service.searchLocationByINEGI(value);
                res.json(new SearchResult(response, 1, response.length, response.length));
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(409).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });

        this.addRoute('post', '/location-nominatim-search', async (req, res) => {
            logger.info('Getting location by INEGI search');
            try {
                const { value } = req.input;
                const response = await this.service.searchLocationByNominatim(value);
                res.json(new SearchResult(response, 1, response.length, response.length));
            } catch (error) {
                if (error instanceof entityErrors.GenericError) {
                    return res.status(409).json([error.message]);
                }
                res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new LocationsController();

module.exports = myself.getApp();
