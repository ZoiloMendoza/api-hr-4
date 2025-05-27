'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('PaymentTypes', 'name', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true, // Agregar restricción de unicidad
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('PaymentTypes', 'name', {
            type: Sequelize.STRING,
            allowNull: false,
            unique: false, // Eliminar restricción de unicidad
        });
    },
};
