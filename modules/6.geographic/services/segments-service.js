const { segment, location, segmentLocation } = models;
const LocationsService = require('./locations-service'); //DUDA: ¿por qué no se importa desde helpers?
const { CRUDService } = helpers;
const { calcularRuta, obtenerDetalleRuta } = require('../helpers/api-inegi');
class SegmentsService extends CRUDService {
    constructor() {
        super(segment);
    }

    async calculateSegment(
        optimalRoute = true,
        tollRoute = true,
        freeRoute = true,
        originId,
        destinationId,
    ) {
        const origin = await LocationsService.readById(originId);
        const destination = await LocationsService.readById(destinationId);

        if (!origin || !destination) {
            throw new Error('Origen o destino no encontrados.');
        }

        if (
            !origin.routingLineId ||
            !origin.routingSourceId ||
            !origin.routingTargetId
        ) {
            throw new Error('Los datos de origen son incompletos.');
        }

        if (
            !destination.routingLineId ||
            !destination.routingSourceId ||
            !destination.routingTargetId
        ) {
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
                calcularRuta('libre', parametros).then((result) => ({
                    type: 'freeRoute',
                    geojson: result.data.geojson,
                    tollBoothsAmount: result.data.costo_caseta,
                    time: result.data.tiempo_min,
                    km: result.data.long_km,
                    peaje: result.data.peaje !== 'f',
                })),
            );
            promises.push(
                obtenerDetalleRuta('detalle_l', parametros).then((result) => ({
                    type: 'freeRouteDetail',
                    detail: result.data,
                })),
            );
        }
        if (tollRoute) {
            promises.push(
                calcularRuta('cuota', parametros).then((result) => ({
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
                obtenerDetalleRuta('detalle_c', parametros).then((result) => ({
                    type: 'tollRouteDetail',
                    detail: result.data,
                })),
            );
        }
        if (optimalRoute) {
            promises.push(
                calcularRuta('optima', parametros).then((result) => ({
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
                obtenerDetalleRuta('detalle_o', parametros).then((result) => ({
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
                const {
                    type,
                    geojson,
                    detail,
                    tollBoothsAmount,
                    time,
                    km,
                    peaje,
                } = result.value;
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

    // async updateSegmentWithTollBooths(segmentId, updatedSegmentData) {
    //     const { tollBooths, ...segmentData } = updatedSegmentData;

    //     const segment = await this.readById(segmentId);
    //     if (!segment) {
    //         throw new Error('Segmento no encontrado.');
    //     }

    //     if (tollBooths && Array.isArray(tollBooths)) {
    //         const tollBoothLocations = await Promise.all(
    //             tollBooths.map(async (tollBooth) => {
    //                 const locationData = {
    //                     name: tollBooth.name,
    //                     value: tollBooth.amount,
    //                     nearestPointGeoString: tollBooth.location,
    //                     type: 'toll',
    //                 };

    //                 const location = await models.location.create(locationData);
    //                 return location.id;
    //             })
    //         );

    //         await segment.setLocations(tollBoothLocations);
    //     }

    //     await segment.update(segmentData);

    //     return segment;
    // }
}

module.exports = new SegmentsService();
