const { location } = models;
const { CRUDController } = helpers;

class LocationsController extends CRUDController {
    constructor() {
        super(location);
        this.addRoute('post', '/location/coordinates', async (req, res) => {
            logger.info('Getting location by coordinates');
            try {
                const { escala, x, y } = req.input;
                const response = await this.service.getLocationByCoordinates(
                    escala,
                    x,
                    y,
                );
                return res.json(response);
            } catch (error) {
                return res.status(500).json([error.message]);
            }
        });
        // this.addRoute('post', '/location-inegi', async (req, res) => {
        //     logger.info('Getting location by INEGI');
        //     try {
        //         const {
        //             scale = 10000,
        //             lng,
        //             lat,
        //             name,
        //             description,
        //         } = req.input;
        //         const response = await this.service.addLocationWithINEGI(
        //             scale,
        //             lng,
        //             lat,
        //             name,
        //             description,
        //         );
        //         return res.json(response);
        //     } catch (error) {
        //         return res.status(500).json([error.message]);
        //     }
        // });
        this.addRoute('put', '/location-inegi/:id', async (req, res) => {
            try {
                const {
                    scale = 10000,
                    lng,
                    lat,
                    name,
                    description,
                } = req.input;
                const { id } = req.params;
                const response = await this.service.updateLocationWithINEGI(
                    id,
                    scale,
                    lng,
                    lat,
                    name,
                    description,
                );
                return res.json(response);
            } catch (error) {
                return res.status(500).json([error.message]);
            }
        });

        this.addRoute('post', '/location-inegi-search', async (req, res) => {
            logger.info('Getting location by INEGI search');
            try {
                const { value } = req.input;
                const response = await this.service.searchLocationByINEGI(
                    value,
                );
                return res.json(response);
            } catch (error) {
                return res.status(500).json([error.message]);
            }
        });
    }
}

const myself = new LocationsController();

module.exports = myself.getApp();
