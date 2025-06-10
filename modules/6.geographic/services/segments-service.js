const { segment } = models;
const LocationsService = require('./locations-service'); //DUDA: ¿por qué no se importa desde helpers?
const { CRUDService, entityErrors } = helpers;
const { calcularRuta, } = require('../helpers/api-google');
const NodeCache = require('node-cache');
class SegmentsService extends CRUDService {
    constructor() {
        super(segment);
        this.cache = new NodeCache({ stdTTL: 2592000 });
    }

    async calculateSegment(
        optimalRoute = false,
        tollRoute = false,
        freeRoute = false,
        originId,
        destinationId,
        isFirst,
        segmentId,
    ) {
        const origin = await LocationsService.readById(originId);
        const destination = await LocationsService.readById(destinationId);

        if (originId === destinationId) {
            throw new entityErrors.GenericError('El origen y el destino no pueden ser iguales.');
        }

        if (!origin || !destination) {
            throw new entityErrors.GenericError('Origen o destino no encontrados.');
        }

        if (!origin.lat || !origin.lng) {
            throw new entityErrors.GenericError('Los datos de origen son incompletos.');
        }

        if (!destination.lat || !destination.lat) {
            throw new entityErrors.GenericError('Los datos de destino son incompletos.');
        }

        const parametros = {
            lat_o: origin.lat,
            lng_o: origin.lng,
            lat_d: destination.lat,
            lng_d: destination.lng,
        };

        const promises = [];
        if(optimalRoute){
            promises.push(
                this.cachedCalcularRuta('optima', parametros).then((result) => ({
                    type: 'optimalRoute',
                    geojson: result.polyline,
                    tollBoothsAmount: result.unit,
                    time: result.staticDuration,
                    km: result.distanceMeters/1000,
                    peaje: result.tolls,
                }))
            )
        } 
        if(tollRoute){
            promises.push(
                this.cachedCalcularRuta('cuota', parametros).then((result) => ({
                    type: 'tollRoute',
                    geojson: result.polyline,
                    tollBoothsAmount: result.unit,
                    time: result.staticDuration,
                    km: result.distanceMeters/1000,
                    peaje: result.tolls,
                }))
            )
        }
        if(freeRoute){
            promises.push(
                this.cachedCalcularRuta('libre', parametros).then((result) => ({
                    type: 'freeRoute',
                    geojson: result.polyline,
                    tollBoothsAmount: result.unit,
                    time: result.staticDuration,
                    km: result.distanceMeters/1000,
                    peaje: result.tolls,
                }))
            )
        }

        const requests = await Promise.allSettled(promises);

        const rutas = {};

        requests.forEach((request) => {
                const { type, geojson, tollBoothsAmount, time, km, peaje } = request.value;
                rutas[type] = {
                    geojson,
                    tollBoothsAmount,
                    time,
                    km,
                    peaje,
                    tollBooths: null
                };
        });

        if (Object.keys(rutas).length === 0) {
            throw new entityErrors.GenericError(
                'No se encontraron rutas disponibles. Verifique los datos de origen y destino.',
            );
        }

        //Es para actualizar kms y peaje del segmento cuando se consulta por primera vez
        if (isFirst && segmentId && rutas.optimalRoute) {
            const { km, tollBoothsAmount } = rutas.optimalRoute;
            await segment.update(
                {
                    kms: km,
                    tollBoothsAmount: tollBoothsAmount,
                },
                {
                    where: { id: segmentId, active: true },
                },
            );
        }

        return rutas;
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
}

module.exports = new SegmentsService();
