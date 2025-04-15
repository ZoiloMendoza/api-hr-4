const { segment } = models;
const LocationsService = require('./locations-service'); //DUDA: ¿por qué no se importa desde helpers?
const { CRUDService } = helpers;
const { calcularRuta } = require('../helpers/api-inegi');
class SegmentsService extends CRUDService {
    constructor() {
        super(segment);
    }

    async calculateSegment(
        optimalRoute = false,
        tollRoute = true,
        freeRoute = false,
        originId,
        destinationId,
    ) {
        const origin = await LocationsService.readById(originId);
        const destination = await LocationsService.readById(destinationId);

        if (!origin || !destination) {
            throw new Error('Origen o destino no encontrados.');
        }

        // Prepara los parámetros para calcular la ruta
        const parametros = {
            id_i: origin.routingLineId,
            source_i: origin.routingSourceId,
            target_i: origin.routingTargetId,
            id_f: destination.routingLineId,
            source_f: destination.routingSourceId,
            target_f: destination.routingTargetId,
            v: 1, // Tipo de vehículo (1 = automóvil)
        };

        // Calcula las rutas según los tipos solicitados
        const rutas = {};
        if (freeRoute) {
            rutas.freeRoute = await calcularRuta('libre', parametros);
        }
        if (tollRoute) {
            rutas.tollRoute = await calcularRuta('cuota', parametros);
        }
        if (optimalRoute) {
            rutas.optimalRoute = await calcularRuta('optima', parametros);
        }

        return rutas;
    }
}

module.exports = new SegmentsService();
