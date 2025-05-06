const axios = require('axios');
const { entityErrors } = helpers;

const API_INEGI = process.env.API_INEGI;
const API_INEGI_KEY = process.env.API_INEGI_KEY;

const PATHS = {
    buscalinea: '/buscalinea',
    buscadestino: '/buscadestino',
    libre: '/libre',
    cuota: '/cuota',
    optima: '/optima',
    detalle_o: '/detalle_o',
    detalle_c: '/detalle_c',
    detalle_l: '/detalle_l',
};

async function buscarLinea(escala, x, y) {
    return makeRequest(PATHS.buscalinea, { escala, x, y });
}

async function buscarDestino(valor) {
    if (valor.length <= 3) {
        throw new entityErrors.GenericError('El valor debe tener más de 3 caracteres.');
    }

    return makeRequest(PATHS.buscadestino, { buscar: valor, num: 15 });
}

async function calcularRuta(tipoRuta, parametros) {
    if (!['libre', 'cuota', 'optima'].includes(tipoRuta)) {
        throw new entityErrors.GenericError('El tipo de ruta debe ser "libre", "cuota" o "optima".');
    }
    return makeRequest(PATHS[tipoRuta], parametros);
}

async function obtenerDetalleRuta(tipoRuta, parametros) {
    if (!['detalle_o', 'detalle_c', 'detalle_l'].includes(tipoRuta)) {
        throw new entityErrors.GenericError('El tipo de ruta debe ser "libre", "cuota" o "optima".');
    }
    return makeRequest(PATHS[tipoRuta], parametros);
}

async function makeRequest(endpoint, parametros) {
    try {
        const payload = new URLSearchParams({
            ...parametros,
            type: 'json',
            key: API_INEGI_KEY,
        }).toString();

        const url = `${API_INEGI}${endpoint}`;

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const jsonResponse = response.data;

        if (jsonResponse.response && jsonResponse.response.success) {
            logger.info(`ZOY API INEGI: ${JSON.stringify(jsonResponse.response)}`);

            if (!jsonResponse.data || Object.keys(jsonResponse.data).length === 0) {
                throw new entityErrors.GenericError('La API de INEGI no encontro la información.');
            }

            return jsonResponse;
        } else {
            throw new entityErrors.GenericError(
                jsonResponse.response.message || 'Error desconocido en la API de INEGI',
            );
        }
    } catch (error) {
        throw new entityErrors.GenericError(`${error.response?.data || error.message}`);
    }
}

module.exports = {
    buscarLinea,
    buscarDestino,
    calcularRuta,
    obtenerDetalleRuta,
};
