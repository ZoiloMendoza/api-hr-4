'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Routes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            routeName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            alias: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            routeType: {
                type: Sequelize.STRING,
            },
            totalKm: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            mealsAmount: {
                //monto por comida
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            tollBoothsAmount: {
                //monto por casetas
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            lodgingAmount: {
                //monto por hospedaje
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            transitAmount: {
                //monto por transito
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            handlingAmount: {
                //monto por maniobras
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            fuelAmount: {
                //monto por combustible
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            routeSalary: {
                //Sueldo por ruta
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
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
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Routes');
    },
};
