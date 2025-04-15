const { location } = models;
const { CRUDService } = helpers;
const { buscarLinea, buscarDestino } = require('../helpers/api-inegi');

class LocationsService extends CRUDService {
    constructor() {
        super(location);
    }

    async getLocationByCoordinates(escala, x, y) {
        const response = await buscarLinea(escala, x, y);
        return response;
    }

    async addLocationWithINEGI(scale, lng, lat, name, description) {
        const responseInegi = await buscarLinea(scale, lng, lat);
        let locationData = null;
        const { data } = responseInegi;
        if (data) {
            const { geojson, source, id_routing_net, nombre, target } = data;
            locationData = {
                name,
                description,
                lat, //TODO: Cambiar a latitud a los de geojson
                lng, //TODO: Cambiar a latitud a los de geojson
                routingLineId: id_routing_net,
                routingSourceId: source,
                routingTargetId: target,
                roadName: nombre,
                scale,
                nearestPointGeoString: geojson,
            };
        } else {
            locationData = {
                name,
                description,
                lat: y,
                lng: x,
                scale,
            };
        }
        return this.create(locationData);
    }

    async updateLocationWithINEGI(id, scale, lng, lat, name, description) {
        const responseInegi = await buscarLinea(scale, lng, lat);
        let locationData = null;
        const { data } = responseInegi;

        if (data) {
            const { geojson, source, id_routing_net, nombre, target } = data;
            locationData = {
                name,
                description,
                lat,
                lng,
                routingLineId: id_routing_net,
                routingSourceId: source,
                routingTargetId: target,
                roadName: nombre,
                scale,
                nearestPointGeoString: geojson,
            };
        } else {
            locationData = {
                name,
                description,
                lat,
                lng,
                scale,
            };
        }
        delete locationData.id;
        return this.update(id, locationData);
    }

    async searchLocationByINEGI(value) {
        const responseInegi = await buscarDestino(value);
        let parseResponse = null;
        if (responseInegi) {
            parseResponse = responseInegi.map((item) => {
                const { geojson, nombre, id_dest } = item;
                const geojsonParsed = JSON.parse(geojson);
                const { coordinates } = geojsonParsed;
                const [lng, lat] = coordinates;
                return {
                    id: id_dest,
                    name: nombre,
                    lat,
                    lng,
                };
            });
        }
        return parseResponse;
    }
}

module.exports = new LocationsService();
