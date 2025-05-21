'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Agregar columna 'city'
        await queryInterface.addColumn('Locations', 'city', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Eliminar columna 'city'
        await queryInterface.removeColumn('Locations', 'city');
    },
};
