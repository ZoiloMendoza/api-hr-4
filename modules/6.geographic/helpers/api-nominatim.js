const axios = require('axios');
const { entityErrors } = helpers;

const API_NOMINATIM = process.env.API_NOMINATIM;

async function searchPlace(q, options = {}) {
    const params = {
        q,
        format: 'json',
        addressdetails: 1,
        limit: options.limit || 10,
        countrycodes: 'mx',
        polygon_geojson: 0,
    };

    try {
        const response = await axios.get(`${API_NOMINATIM}`, { params });
        return response.data.map((place) => ({
            id: place.place_id,
            name: place.display_name,
            lat: place.lat,
            lng: place.lon,
        }));
    } catch (error) {
        throw new entityErrors.GenericError('Error al buscar el lugar en Nominatim.', error);
    }
}

module.exports = {
    searchPlace,
};
