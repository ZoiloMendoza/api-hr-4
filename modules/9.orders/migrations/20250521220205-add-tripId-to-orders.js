'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Orders', 'tripId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Trips',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'ID del viaje asociado al pedido',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Orders', 'tripId');
    },
};
