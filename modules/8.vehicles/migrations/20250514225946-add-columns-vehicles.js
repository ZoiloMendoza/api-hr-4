'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Vehicles', 'vehicleYear', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
        });

        await queryInterface.addColumn('Vehicles', 'vehicleDescription', {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Vehicles', 'vehicleYear');
        await queryInterface.removeColumn('Vehicles', 'vehicleDescription');
    },
};
