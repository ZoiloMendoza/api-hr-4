'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Eliminar todos los registros de la tabla Vehicles
        await queryInterface.bulkDelete('Vehicles', null, {});
    },

    down: async (queryInterface, Sequelize) => {
        // No se puede revertir la eliminación de registros
    },
};
