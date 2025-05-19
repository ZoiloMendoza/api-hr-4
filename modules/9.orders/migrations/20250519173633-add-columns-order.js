'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Orders', 'originClientId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Clients',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'Cliente que proporciona la dirección de origen',
        });

        await queryInterface.addColumn('Orders', 'destinationClientId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Clients',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'Cliente que proporciona la dirección de destino',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Orders', 'originClientId');
        await queryInterface.removeColumn('Orders', 'destinationClientId');
    },
};
