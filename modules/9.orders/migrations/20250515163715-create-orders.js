'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Orders', {
            id: {
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            clientId: {
                type: Sequelize.INTEGER,
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
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Catalogs', // Nombre de la tabla relacionada
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
                comment: 'Servicio seleccionado del catálogo del SAT',
            },
            departureDate: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Fecha de salida de la mercancía',
            },
            arrivalDate: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Fecha de llegada de la mercancía',
            },
            originAddress: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Dirección de origen (proporcionada por el cliente origen)',
            },
            destinationAddress: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Dirección de destino (proporcionada por el cliente destino)',
            },
            remission: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Remisión que identifica cómo se solicitó el servicio (WS-WhatsApp, EM-Email, No folio)',
            },
            observations: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Comentarios adicionales sobre el pedido',
            },
            status: {
                type: Sequelize.ENUM('pending', 'assigned', 'delivered'),
                allowNull: false,
                defaultValue: 'pending',
                comment: 'Estatus inicial del pedido',
            },
            totalKg: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
                comment: 'Peso total en kilogramos',
            },
            quantityProducts: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
                comment: 'Cantidad total de productos',
            },
            serviceDescription: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Descripción del servicio',
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Orders');
    },
};
