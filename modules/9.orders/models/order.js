'use strict';

module.exports = (sequelize, DataTypes) => {
    class Order extends helpers.CRUDModel {
        static associate(models) {
            Order.belongsTo(models.client, {
                foreignKey: 'clientId',
                as: 'client',
            });

            Order.belongsTo(models.catalog, {
                foreignKey: 'serviceId',
                as: 'service',
            });

            Order.hasMany(models.productorder, {
                foreignKey: 'orderId',
                as: 'productsOrders',
            });
        }
    }

    Order.init(
        {
            clientId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Clients',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
                comment: 'Cliente que solicita el servicio',
            },
            serviceId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Catalogs',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
                comment: 'Servicio seleccionado del catálogo del SAT',
            },
            departureDate: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'Fecha de salida de la mercancía',
            },
            arrivalDate: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'Fecha de llegada de la mercancía',
            },
            originAddress: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Dirección de origen (proporcionada por el cliente origen)',
            },
            destinationAddress: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Dirección de destino (proporcionada por el cliente destino)',
            },
            remission: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Remisión que identifica cómo se solicitó el servicio (WS-WhatsApp, EM-Email, No folio)',
            },
            observations: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Comentarios adicionales sobre el pedido',
            },
            status: {
                type: DataTypes.ENUM('pending', 'assigned', 'delivered'),
                allowNull: false,
                defaultValue: 'pending',
                comment: 'Estatus inicial del pedido',
            },
            totalKg: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
                comment: 'Peso total en kilogramos',
            },
            quantityProducts: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                comment: 'Cantidad total de productos',
            },
            serviceDescription: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Descripción del servicio',
            },
            freightCost: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
                comment: 'Costo del flete en pesos mexicanos',
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Order',
        },
    );

    return Order;
};
