const { order, route, location, segment } = models;
const { CRUDService, entityErrors } = helpers;
const { Op } = require('sequelize');
class OrdersService extends CRUDService {
    constructor() {
        super(order);
    }

    async getOrdersForRoute(routeId, q) {
        // Obtener los segmentos asociados a la ruta
        const rt = await route.findByPk(routeId, {
            where: {
                active: true,
            },
            include: [
                {
                    model: segment,
                    as: 'segments',
                    where: {
                        active: true, // Filtrar segmentos activos
                    },
                    include: [
                        {
                            model: location,
                            as: 'originLocation',
                            attributes: ['city', 'state'], // Obtener solo la ciudad de origen
                        },
                        {
                            model: location,
                            as: 'destinationLocation',
                            attributes: ['city', 'state'], // Obtener solo la ciudad de destino
                        },
                    ],
                },
            ],
        });

        if (!rt) {
            throw new entityErrors.EntityNotFoundError('La ruta especificada no existe');
        }

        // Extraer las ciudades de las ubicaciones asociadas a los segmentos
        const cityStatePairs = new Set();
        rt.segments.forEach((segment) => {
            if (segment.originLocation?.city && segment.originLocation?.state) {
                cityStatePairs.add(
                    `${segment.originLocation.city.toLowerCase()},${segment.originLocation.state.toLowerCase()}`,
                );
            }
            if (segment.destinationLocation?.city && segment.destinationLocation?.state) {
                cityStatePairs.add(
                    `${segment.destinationLocation.city.toLowerCase()},${segment.destinationLocation.state.toLowerCase()}`,
                );
            }
        });

        if (cityStatePairs.size === 0) {
            throw new entityErrors.GenericError('No hay ciudades y estados asociados a los tramos de esta ruta');
        }

        // Filtrar los pedidos que coincidan con las ciudades
        const orders = await this.findAndCountAllCustom({
            filter: {
                ...q.filter,
            },
            where: {
                [Op.and]: [
                    { active: true }, // Filtrar solo pedidos activos
                    { status: 'pending' },
                    { tripId: null },
                    {
                        [Op.or]: [
                            ...Array.from(cityStatePairs).map((pair) => {
                                const [city, state] = pair.split(',');
                                return {
                                    [Op.and]: [
                                        {
                                            originAddress: {
                                                [Op.like]: `%${city}%`, // Coincidencia parcial con la ciudad en originAddress
                                            },
                                        },
                                        {
                                            originAddress: {
                                                [Op.like]: `%${state}%`, // Coincidencia parcial con el estado en originAddress
                                            },
                                        },
                                    ],
                                };
                            }),
                            ...Array.from(cityStatePairs).map((pair) => {
                                const [city, state] = pair.split(',');
                                return {
                                    [Op.and]: [
                                        {
                                            destinationAddress: {
                                                [Op.like]: `%${city}%`, // Coincidencia parcial con la ciudad en destinationAddress
                                            },
                                        },
                                        {
                                            destinationAddress: {
                                                [Op.like]: `%${state}%`, // Coincidencia parcial con el estado en destinationAddress
                                            },
                                        },
                                    ],
                                };
                            }),
                        ],
                    },
                ],
            },
            include: [
                {
                    model: models.client,
                    as: 'client',
                    attributes: { exclude: ['active', 'createdAt', 'updatedAt', 'companyId'] },
                    where: {
                        active: true,
                    },
                    required: true,
                },
            ],
            offset: q.start,
            limit: q.limit,
            order: [[q.orderBy, q.order]],
        });

        if (!orders.rows.length) {
            throw new entityErrors.GenericError('No se encontraron pedido disponibles para esta ruta');
        }

        return { rows: orders.rows, count: orders.count };
    }
}
module.exports = new OrdersService();
