'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Orders', 'freightCost', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.0,
            comment: 'Costo del flete en pesos mexicanos',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Orders', 'freightCost');
    },
};
