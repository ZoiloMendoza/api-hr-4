const { segment, location, segmentLocation } = models;
const LocationsService = require('./locations-service'); //DUDA: ¿por qué no se importa desde helpers?
const { CRUDService } = helpers;
const { calcularRuta, obtenerDetalleRuta } = require('../helpers/api-inegi');
const NodeCache = require('node-cache');
class SegmentsService extends CRUDService {
    constructor() {
        super(segment);
        this.cache = new NodeCache({ stdTTL: 3600 });
    }

    async calculateSegment(optimalRoute = true, tollRoute = true, freeRoute = true, originId, destinationId) {
        const origin = await LocationsService.readById(originId);
        const destination = await LocationsService.readById(destinationId);

        if (!origin || !destination) {
            throw new Error('Origen o destino no encontrados.');
        }

        if (!origin.routingLineId || !origin.routingSourceId || !origin.routingTargetId) {
            throw new Error('Los datos de origen son incompletos.');
        }

        if (!destination.routingLineId || !destination.routingSourceId || !destination.routingTargetId) {
            throw new Error('Los datos de destino son incompletos.');
        }

        const parametros = {
            id_i: origin.routingLineId,
            source_i: origin.routingSourceId,
            target_i: origin.routingTargetId,
            id_f: destination.routingLineId,
            source_f: destination.routingSourceId,
            target_f: destination.routingTargetId,
            v: 5, // Tipo de vehículo (1 = automóvil)
        };

        const promises = [];
        if (freeRoute) {
            promises.push(
                this.cachedCalcularRuta('libre', parametros).then((result) => ({
                    type: 'freeRoute',
                    geojson: result.data.geojson,
                    tollBoothsAmount: result.data.costo_caseta,
                    time: result.data.tiempo_min,
                    km: result.data.long_km,
                    peaje: result.data.peaje !== 'f',
                })),
            );
            promises.push(
                this.cachedObtenerDetalleRuta('detalle_l', parametros).then((result) => ({
                    type: 'freeRouteDetail',
                    detail: result.data,
                })),
            );
        }
        if (tollRoute) {
            promises.push(
                this.cachedCalcularRuta('cuota', parametros).then((result) => ({
                    type: 'tollRoute',
                    geojson: result.data.geojson,
                    geojson: result.data.geojson,
                    tollBoothsAmount: result.data.costo_caseta,
                    time: result.data.tiempo_min,
                    km: result.data.long_km,
                    peaje: result.data.peaje !== 'f',
                })),
            );
            promises.push(
                this.cachedObtenerDetalleRuta('detalle_c', parametros).then((result) => ({
                    type: 'tollRouteDetail',
                    detail: result.data,
                })),
            );
        }
        if (optimalRoute) {
            promises.push(
                this.cachedCalcularRuta('optima', parametros).then((result) => ({
                    type: 'optimalRoute',
                    geojson: result.data.geojson,
                    geojson: result.data.geojson,
                    tollBoothsAmount: result.data.costo_caseta,
                    time: result.data.tiempo_min,
                    km: result.data.long_km,
                    peaje: result.data.peaje !== 'f',
                })),
            );
            promises.push(
                this.cachedObtenerDetalleRuta('detalle_o', parametros).then((result) => ({
                    type: 'optimalRouteDetail',
                    detail: result.data,
                })),
            );
        }

        const results = await Promise.allSettled(promises);

        const rutas = {};
        const detalles = {};

        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                const { type, geojson, detail, tollBoothsAmount, time, km, peaje } = result.value;
                if (type.endsWith('Detail')) {
                    detalles[type.replace('Detail', '')] = detail;
                } else {
                    rutas[type] = {
                        geojson,
                        tollBoothsAmount,
                        time,
                        km,
                        peaje,
                    };
                }
            }
        });

        const formattedRoutes = Object.keys(rutas).reduce((acc, key) => {
            const detail = detalles[key];
            if (detail) {
                acc[key] = {
                    ...rutas[key],
                    tollBooths: detail
                        .filter((item) => item.punto_caseta)
                        .map((item) => ({
                            location: item.punto_caseta,
                            amount: item.costo_caseta,
                            name: item.direccion,
                        })),
                };
            }
            return acc;
        }, {});

        return formattedRoutes;
    }

    async cachedCalcularRuta(tipoRuta, parametros) {
        const cacheKey = `calcularRuta-${tipoRuta}-${JSON.stringify(parametros)}`;
        let result = this.cache.get(cacheKey);

        if (!result) {
            logger.info(`Cache miss for calcularRuta: ${cacheKey}`);
            result = await calcularRuta(tipoRuta, parametros); // Llama a la API
            this.cache.set(cacheKey, result); // Almacena el resultado en el caché
        } else {
            logger.info(`Cache hit for calcularRuta: ${cacheKey}`);
        }

        return result;
    }

    async cachedObtenerDetalleRuta(tipoDetalle, parametros) {
        const cacheKey = `obtenerDetalleRuta-${tipoDetalle}-${JSON.stringify(parametros)}`;
        let result = this.cache.get(cacheKey);

        if (!result) {
            logger.info(`Cache miss for obtenerDetalleRuta: ${cacheKey}`);
            result = await obtenerDetalleRuta(tipoDetalle, parametros); // Llama a la API
            this.cache.set(cacheKey, result); // Almacena el resultado en el caché
        } else {
            logger.info(`Cache hit for obtenerDetalleRuta: ${cacheKey}`);
        }

        return result;
    }
}

module.exports = new SegmentsService();
