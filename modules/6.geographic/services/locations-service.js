const { location } = models;
const { CRUDService, entityErrors } = helpers;
const { buscarLinea, buscarDestino } = require('../helpers/api-google');
const { searchPlace } = require('../helpers/api-nominatim');
const { placesAutocomplete, geocodingAddress, validateLocation } = require('../helpers/api-google');
const NodeCache = require('node-cache');
class LocationsService extends CRUDService {
    constructor() {
        super(location);
        this.cache = new NodeCache({ stdTTL: 2592000 }); // 1 mes
    }

    async updateLocationWithGOOGLE(id, body) {
        const { lng, lat, name, description, city, state } = body;

        const currentLocation = await this.readById(id);

        if (!currentLocation) {
            throw new entityErrors.GenericError(`No se encontró la ubicación con el ID ${id}.`);
        }

        if(lng && lat){
            const cacheKey = `google-location:update:${lat}:${lng}`;
            let isInvalidLocationResponse = this.cache.get(cacheKey);
            
            if (!isInvalidLocationResponse) {
                isInvalidLocationResponse = await validateLocation(`${lat},${lng}`);
                this.cache.set(cacheKey, isInvalidLocationResponse);
            }

            if(isInvalidLocationResponse.isInvalidLocation){
                throw new entityErrors.GenericError("No se encontró línea de red en las coordenadas enviadas, intenta con otras coordenadas");
            }
        }

        let locationData = {
            name,
            description,
            lat,
            lng,
            city,
            state,
        };

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
    }

    async searchLocationByGoogle(value) {
        const cacheKey = `google:places:autocomplete:${value}`;
        let responseAutocomplete = this.cache.get(cacheKey);

        if (!responseAutocomplete) {
            responseAutocomplete = await placesAutocomplete(value);
            this.cache.set(cacheKey, responseAutocomplete);
        }

        return responseAutocomplete;
    }

    async geocodingAddressByGoogle(value) {
        const cacheKey = `google:v3:geocode:${value}`;
        let responseGeocodingAddress = this.cache.get(cacheKey);

        if (!responseGeocodingAddress) {
            responseGeocodingAddress = await geocodingAddress(value);
            this.cache.set(cacheKey, responseGeocodingAddress);
        }

        return responseGeocodingAddress;
    }
}

module.exports = new LocationsService();
