const { ubication } = models;
const { CRUDService } = helpers;

class UbicationsService extends CRUDService {
    constructor() {
        super(ubication);
    }
}

module.exports = new UbicationsService();
