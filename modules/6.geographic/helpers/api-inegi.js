const axios = require('axios');

const API_INEGI = process.env.API_INEGI;
const API_INEGI_KEY = process.env.API_INEGI_KEY;

const PATHS = {
    buscalinea: '/buscalinea',
    buscadestino: '/buscadestino',
    libre: '/libre',
    cuota: '/cuota',
    optima: '/optima',
};

async function buscarLinea(escala, x, y) {
    try {
        const payload = new URLSearchParams({
            type: 'json',
            key: API_INEGI_KEY,
            escala,
            x,
            y,
        }).toString();

        const url = `${API_INEGI}${PATHS.buscalinea}`;

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const jsonResponse = response.data;

        if (jsonResponse.response && jsonResponse.response.success) {
            return jsonResponse;
        } else {
            throw new Error(
                jsonResponse.response.message ||
                    'Error desconocido en la API de INEGI',
            );
        }
    } catch (error) {
        throw new Error(
            `Error en la solicitud a la API de INEGI: ${
                error.response?.data || error.message
            }`,
        );
    }
}

async function buscarDestino(valor) {
    if (valor.length <= 3) {
        throw new Error('El valor debe tener más de 3 caracteres.');
    }

    try {
        const payload = new URLSearchParams({
            type: 'json',
            buscar: valor,
            num: 15,
            key: API_INEGI_KEY,
        }).toString();

        const url = `${API_INEGI}${PATHS.buscadestino}`;

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const jsonResponse = response.data;

        if (jsonResponse.response && jsonResponse.response.success) {
            if (jsonResponse.data && jsonResponse.data.length > 0) {
                return jsonResponse.data;
            } else {
                throw new Error(
                    'No se encontraron resultados para el valor proporcionado.',
                );
            }
        } else {
            throw new Error(
                jsonResponse.response.message ||
                    'Error desconocido en la API de INEGI',
            );
        }
    } catch (error) {
        throw new Error(
            `Error en la solicitud a la API de INEGI: ${
                error.response?.data || error.message
            }`,
        );
    }
}

async function calcularRuta(tipoRuta, parametros) {
    try {
        if (!['libre', 'cuota', 'optima'].includes(tipoRuta)) {
            throw new Error(
                'El tipo de ruta debe ser "libre", "cuota" o "optima".',
            );
        }
        const payload = new URLSearchParams({
            ...parametros,
            type: 'json',
            key: API_INEGI_KEY,
        }).toString();

        const url = `${API_INEGI}${PATHS[tipoRuta]}`;
        logger.info(`Llamando a la API de INEGI para calcular la ruta ${url}`);
        logger.info(`payload: ${JSON.stringify(payload)}`);

        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const jsonResponse = response.data;

        if (jsonResponse.response && jsonResponse.response.success) {
            return jsonResponse;
        } else {
            throw new Error(
                jsonResponse.response.message ||
                    'Error desconocido en la API de INEGI',
            );
        }
    } catch (error) {
        throw new Error(
            `Error en la solicitud a la API de INEGI: ${
                error.response?.data || error.message
            }`,
        );
    }
}

module.exports = {
    buscarLinea,
    buscarDestino,
    calcularRuta,
};
