const { route, segment, routesegment } = models;
const { CRUDService, entityErrors } = helpers;
const crypto = require('crypto');
class RoutesService extends CRUDService {
    constructor() {
        super(route);
    }

    async createRouteWithSegments(routeData, user) {
        const { segments, ...routeDetails } = routeData;
        const loggedUser = user;//zmm

        if (!loggedUser) {
            throw new entityErrors.GenericError('Usuario no encontrado');
        }
        if (!Array.isArray(segments) || segments.length === 0) {
            throw new entityErrors.GenericError('Debe tener al menos un tramo');
        }

        const segmentIds = segments.map((segment) => segment.segmentId);

        const duplicateSegmentIds = segmentIds.filter((id, index) => segmentIds.indexOf(id) !== index);

        const orderIndexes = segments.map((segment) => segment.orderIndex);

        const duplicateOrderIndexes = orderIndexes.filter((index, i) => orderIndexes.indexOf(index) !== i);

        if (duplicateOrderIndexes.length > 0) {
            throw new entityErrors.GenericError(
                `La ruta no puede tener índices de orden duplicados. Índices duplicados: ${[
                    ...new Set(duplicateOrderIndexes),
                ].join(', ')}`,
            );
        }

        const existingSegments = await models.segment.findAll({
            where: {
                id: segmentIds,
                companyId: loggedUser.company.id,
            },
            include: [
                {
                    model: models.location,
                    as: 'originLocation',
                    attributes: ['id', 'name'],
                },
                {
                    model: models.location,
                    as: 'destinationLocation',
                    attributes: ['id', 'name'],
                },
            ],
        });

        if (duplicateSegmentIds.length > 0) {
            throw new entityErrors.GenericError(
                `La ruta no puede tener segmentos duplicados. IDs duplicados: ${[...new Set(duplicateSegmentIds)].join(
                    ', ',
                )}`,
            );
        }

        if (existingSegments.length !== segments.length) {
            throw new entityErrors.GenericError('Algunos tramos no están disponibles, seleccione otros');
        }

        const segmentTypes = existingSegments.map((segment) => segment.type);
        const uniqueTypes = [...new Set(segmentTypes)];

        let segmentsType;
        if (uniqueTypes.length === 1) {
            segmentsType = uniqueTypes[0];
        } else {
            segmentsType = 'multi';
        }

        const orderedSegments = segments.sort((a, b) => a.orderIndex - b.orderIndex);

        const firstSegment = existingSegments.find((segment) => segment.id === orderedSegments[0].segmentId);

        const lastSegment = existingSegments.find(
            (segment) => segment.id === orderedSegments[orderedSegments.length - 1].segmentId,
        );

        const startCity = firstSegment.originLocation.name;
        const endCity = lastSegment.destinationLocation.name;

        let routeName;
        let routeType;
        if (startCity === endCity && segments.length > 1) {
            // Viaje redondo
            const secondSegment = existingSegments.find((segment) => segment.id === orderedSegments[1].segmentId);
            const middleCity = secondSegment ? secondSegment.originLocation.name : '';
            routeName = `${startCity} - ${middleCity} - ${endCity}`;
            routeType = 'roundtrip';
        } else {
            // Viaje sencillo
            routeName = `${startCity} - ${endCity}`;
            routeType = 'oneway';
        }

        const alias = this.generarAlias();

        const newRoute = await this.create({
            ...routeDetails,
            routeName,
            routeType,
            alias,
        });

        const routeSegments = segments.map((segment) => ({
            routeId: newRoute.id,
            segmentId: segment.segmentId,
            orderIndex: segment.orderIndex,
        }));

        await models.routesegment.bulkCreate(routeSegments);

        const createdRoute = await models.route.findByPk(newRoute.id, {
            include: [
                {
                    model: models.segment,
                    as: 'segments',
                    attributes: {
                        exclude: ['companyId', 'active', 'createdAt', 'updatedAt'],
                    },
                    through: { attributes: ['orderIndex'] },
                    include: [
                        {
                            model: models.location,
                            as: 'originLocation',
                            attributes: ['id', 'name'],
                        },
                        {
                            model: models.location,
                            as: 'destinationLocation',
                            attributes: ['id', 'name'],
                        },
                    ],
                },
            ],
        });

        if (!createdRoute) {
            throw new entityErrors.GenericError('No se pudo crear la ruta');
        }

        const response = {
            ...this.toJson(createdRoute),
            segmentsType,
        };

        return response;
    }

    //no se si es necesario
    slugify(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/--+/g, '-');
    }

    generarAlias() {
        const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const id = crypto.randomUUID().slice(0, 6);
        return `#R-${fecha}-${id}`;
    }
}

module.exports = new RoutesService();
