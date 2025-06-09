const axios = require('axios');
const { entityErrors } = helpers;

const API_GOOGLE_KEY = process.env.API_GOOGLE_KEY;

const PATHS = {
    computeRoutes: 'https://routes.googleapis.com/directions/v2:computeRoutes',
    placesAutocomplete: 'https://places.googleapis.com/v1/places:autocomplete',
    geocoding: 'https://maps.googleapis.com/maps/api/geocode'
};

async function placesAutocomplete(input) {
    const body = {
        input
    };

    try {
        const fieldMask = 'suggestions.placePrediction.text.text'
        const data = await makeRequest(PATHS.placesAutocomplete, body, fieldMask);

        if (!data.suggestions) {
            throw new entityErrors.GenericError(
                jsonResponse.response?.message ||
                    'Hubo un problema al procesar la solicitud. Por favor, verifique los datos ingresados e inténtelo nuevamente.',
            );
        }

        if (data.suggestions.length === 0) {
            return [];
        }

        const suggestions = data.suggestions.map((suggestion) => (
            suggestion.placePrediction.text.text
        ));

        return suggestions
    } catch (error) {
        throw new entityErrors.GenericError('Error al buscar el lugar en google places:autocomplete.', error);
    }
}

async function geocodingAddress(input) {
    try {
        const response = await axios.get(`${PATHS.geocoding}/json`, {
            params: {
              address: input,
              key: API_GOOGLE_KEY,
            }
        });
        
        if (response.status !== 200) {
            throw new entityErrors.GenericError(
                jsonResponse.response?.message ||
                    'Hubo un problema al procesar la solicitud. Por favor, verifique los datos ingresados e inténtelo nuevamente.',
            );
        }

        if (!response.data.results) {
            throw new entityErrors.GenericError(
                jsonResponse.response?.message ||
                    'Hubo un problema al procesar la solicitud. Por favor, verifique los datos ingresados e inténtelo nuevamente.',
            );
        }

        if (response.data.results.length === 0) {
            return [];
        }

        const result = response.data.results;


        const formatAddress = parseAddress(result[0].address_components);

        const coords = {
            latitude: null,
            longitude: null
        }

        if(result[0].navigation_points && result[0].navigation_points.length > 0){
            coords.latitude = result[0].navigation_points[0].location.latitude;
            coords.longitude = result[0].navigation_points[0].location.longitude;
        } else {
            coords.latitude = result[0].geometry.location.lat;
            coords.longitude = result[0].geometry.location.lng;
        }

        return {
            ...formatAddress,
            ...coords
        }
    } catch (error) {
        throw new entityErrors.GenericError('Error al geocodificar una direccion en google v3:geocoding.', error);
    }
}

async function validateLocation(input) {
    try {
        const response = await axios.get(`${PATHS.geocoding}/json`, {
            params: {
              latlng: input,
              key: API_GOOGLE_KEY,
            }
        });
        
        if (response.status !== 200) {
            throw new entityErrors.GenericError(
                jsonResponse.response?.message ||
                    'Hubo un problema al procesar la solicitud. Por favor, verifique los datos ingresados e inténtelo nuevamente.',
            );
        }

        if (!response.data.results) {
            throw new entityErrors.GenericError(
                jsonResponse.response?.message ||
                    'Hubo un problema al procesar la solicitud. Por favor, verifique los datos ingresados e inténtelo nuevamente.',
            );
        }

        if (response.data.results.length === 0) {
            return {
                isInvalidLocation: false
            };
        }

        isInvalid = response.data.results[0].types.includes('plus_code');
        return {
            isInvalidLocation: isInvalid
        };
    } catch (error) {
        throw new entityErrors.GenericError('Error al validar ubicacion en google v3:geocoding.reverse.', error);
    }
}


async function calcularRuta(tipoRuta, parametros) {
    if (!['libre', 'cuota', 'optima'].includes(tipoRuta)) {
        throw new entityErrors.GenericError('El tipo de ruta debe ser "libre", "cuota" o "optima".');
    }
    const body = {
        origin:{
            location: {
                latLng: {
                    latitude: parametros.lat_o,
                    longitude: parametros.lng_o 
                },
                heading: 0
            }
        },
        destination:{
                location: {
                latLng: {
                    latitude: parametros.lat_d,
                    longitude: parametros.lng_d
                },
                heading: 0
            }
        },
        polylineEncoding: 'GEO_JSON_LINESTRING',
        extraComputations: ['TOLLS', 'FUEL_CONSUMPTION']
    };

    if(tipoRuta === 'cuota'){
        body.routeModifiers = {
            avoidTolls: false,
        }
    } else if(tipoRuta === 'libre'){
        body.routeModifiers = {
            avoidTolls: true,
        }
    }

    const  fieldMask = 'routes.distanceMeters,routes.staticDuration,routes.polyline,routes.description,routes.warnings,routes.travelAdvisory.tollInfo.estimatedPrice.units';
    const data = await makeRequest(PATHS.computeRoutes, body, fieldMask);
    if (!data.routes || Object.keys(data.routes).length === 0) {
        throw new entityErrors.GenericError(
            'No se encontraron resultados para su búsqueda. Por favor, intente con otros parámetros.',
        );
    }

    const routes =  data.routes[0];

    const formatResponse = {
        polyline: routes.polyline,
        unit: getUnits(routes.travelAdvisory), 
        staticDuration: getMinutes(routes.staticDuration),
        distanceMeters: routes.distanceMeters,
        tolls: hasTolls(routes)
    }

    logger.info(`API GOOGLE: ${JSON.stringify(formatResponse)}`);
    return formatResponse;
}


async function makeRequest(endpoint, body, fieldMask) {
    try {
        const response = await axios.post(endpoint, body, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_GOOGLE_KEY,
                'X-Goog-FieldMask': fieldMask,
            },
        });

        if (!response) {
            throw new entityErrors.GenericError(
                'No se pudo procesar la solicitud en este momento. Por favor, inténtelo de nuevo más tarde.',
            );
        }

        // Verificar si success es false
        if (response.status !== 200) {
            throw new entityErrors.GenericError(
                jsonResponse.response?.message ||
                    'Hubo un problema al procesar la solicitud. Por favor, verifique los datos ingresados e inténtelo nuevamente.',
            );
        }

        // Verificar si los datos están vacíos
        if (!response.data) {
            throw new entityErrors.GenericError(
                'No se encontraron resultados para su búsqueda. Por favor, intente con otros parámetros.',
            );
        }

        return response.data;
    } catch (error) {
        // Manejo de errores
        throw new entityErrors.GenericError(
            `${error.response?.data || 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.'}`,
        );
    }
}

function getUnits(travelAdvisory) {
    const amount = travelAdvisory?.tollInfo?.estimatedPrice?.[0]?.units ?? 0;
    return parseInt(amount)
}

function getMinutes(staticDuration) {
    const s = staticDuration.slice(0, staticDuration.length)
    return Math.round(parseInt(s)/60);
}

function hasTolls(result){
    let hasToll = false
    if (result.hasOwnProperty('warnings')) {
        result.warnings.forEach((warning) => {
            if(warning === "Hay peajes") {
                hasToll = true
                return ;
            }
        })
    } 
    return hasToll;
}

function parseAddress(address_components = []) {
    const address = {
        street: '',
        street_number: '', 
        colony: '',
        postal_code: '',
        city: '',
        state: '',
        country: ''
    };

    for (const component of address_components) {
        const types = component.types;

        if (types.includes('route')) address.street = component.long_name;
        if (types.includes('street_number')) address.street_number = component.long_name;
        if (types.includes('sublocality')) address.colony = component.long_name;
        if (types.includes('postal_code')) address.postal_code = component.long_name;
        if (types.includes('locality')) address.city = component.long_name;
        if (types.includes('administrative_area_level_1')) address.state = component.long_name;
        if (types.includes('country')) address.country = component.long_name;
    }

    return address;
}

module.exports = {
    validateLocation,
    placesAutocomplete,
    geocodingAddress,
    calcularRuta,
};
