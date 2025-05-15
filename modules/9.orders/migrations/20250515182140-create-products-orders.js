'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ProductOrders', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            weight: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
                comment: 'Peso de la mercancía por unidad',
            },
            value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: 'Valor del flete en pesos mexicanos',
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
                comment: 'Cantidad de productos',
            },
            orderId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Orders',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'ID del pedido relacionado',
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Catalogs',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
                comment: 'ID del producto relacionado',
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
        await queryInterface.dropTable('ProductOrders');
    },
};
