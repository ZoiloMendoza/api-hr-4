'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Locations', 'routingLineId', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.addColumn('Locations', 'routingSourceId', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.addColumn('Locations', 'routingTargetId', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.addColumn('Locations', 'roadName', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn('Locations', 'nearestPointGeojson', {
            type: Sequelize.JSON,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Locations', 'routingLineId');
        await queryInterface.removeColumn('Locations', 'routingSourceId');
        await queryInterface.removeColumn('Locations', 'routingTargetId');
        await queryInterface.removeColumn('Locations', 'roadName');
        await queryInterface.removeColumn('Locations', 'nearestPointGeojson');
    },
};
