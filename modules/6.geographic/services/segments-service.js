const { segment } = models;
const { CRUDService } = helpers;

class LocationsService extends CRUDService {
    constructor() {
        super(segment);
    }
}

module.exports = new LocationsService();
