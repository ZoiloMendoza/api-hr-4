'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Locations', 'type', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn('Locations', 'value', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Locations', 'type');
        await queryInterface.removeColumn('Locations', 'value');
    },
};
