'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Trips', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            tripCode: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true, // El folio debe ser único
            },
            routeId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Routes', // Nombre de la tabla de rutas
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            vehicleId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Vehicles', // Nombre de la tabla de vehículos
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            teleVia: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            totalKm: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                allowNull: true,
            },
            mealsAmount: {
                // Monto por comida
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                allowNull: true,
            },
            tollBoothsAmount: {
                // Monto por casetas
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                allowNull: true,
            },
            lodgingAmount: {
                // Monto por hospedaje
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                allowNull: true,
            },
            transitAmount: {
                // Monto por tránsito
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                allowNull: true,
            },
            handlingAmount: {
                // Monto por maniobras
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                allowNull: true,
            },
            fuelAmount: {
                // Monto por combustible
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                allowNull: true,
            },
            pendingExpenses: {
                // Gastos pendientes
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
                allowNull: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'documenting',
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            companyId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Companies',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            creationDate: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'), // Igual que createdAt
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Trips');
    },
};
