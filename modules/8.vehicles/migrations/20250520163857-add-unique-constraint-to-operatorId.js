'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Vehicles', 'operatorId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            unique: true,
            references: {
                model: 'Operators',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Vehicles', 'operatorId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            unique: false,
            references: {
                model: 'Operators',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },
};
