const { location } = models;
const { CRUDService, entityErrors } = helpers;
const { buscarLinea, buscarDestino } = require('../helpers/api-inegi');
const { searchPlace } = require('../helpers/api-nominatim');
const NodeCache = require('node-cache');
class LocationsService extends CRUDService {
    constructor() {
        super(location);
        this.cache = new NodeCache({ stdTTL: 86400 }); // 1 día
    }

    async updateLocationWithINEGI(id, body) {
        const { scale = 100000, lng, lat, name, description, city, state } = body;

        const currentLocation = await this.readById(id);

        if (!currentLocation) {
            throw new entityErrors.GenericError(`No se encontró la ubicación con el ID ${id}.`);
        }

        if (currentLocation.lat === lat && currentLocation.lng === lng) {
            return currentLocation;
        }

        const cacheKey = `inegi:update:${scale}:${lng}:${lat}`;
        let responseInegi = this.cache.get(cacheKey);

        if (!responseInegi) {
            responseInegi = await buscarLinea(scale, lng, lat);
            this.cache.set(cacheKey, responseInegi);
        }

        let locationData = null;
        const { data } = responseInegi;

        if (data) {
            const { geojson, source, id_routing_net, nombre, target } = data;
            locationData = {
                name,
                description,
                lat,
                lng,
                city,
                state,
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
                city,
                state,
            };
        }

        delete locationData.id;
        return this.update(id, locationData);
    }

    async searchLocationByINEGI(value) {
        const cacheKey = `inegi:search:${value}`;
        let responseInegi = this.cache.get(cacheKey);

        if (!responseInegi) {
            responseInegi = await buscarDestino(value);
            this.cache.set(cacheKey, responseInegi);
        }

        let parseResponse = null;
        if (responseInegi) {
            parseResponse = responseInegi.data.map((item) => {
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

    async searchLocationByNominatim(value) {
        const cacheKey = `nominatim:search:${value}`;
        let responseNominatim = this.cache.get(cacheKey);

        if (!responseNominatim) {
            responseNominatim = await searchPlace(value);
            this.cache.set(cacheKey, responseNominatim);
        }

        return responseNominatim;
    }
}

module.exports = new LocationsService();
