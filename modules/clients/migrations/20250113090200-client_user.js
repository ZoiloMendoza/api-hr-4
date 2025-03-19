'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'clientId', {
            type: Sequelize.INTEGER,
            allowNull: true, // Allow NULL for existing data; set to false if all users should have a client
            references: {
                model: 'Clients', // Name of the target table
                key: 'id',       // Primary key of the target table
            },
            onUpdate: 'CASCADE', // Update clientId if the id in Clients changes
            onDelete: 'SET NULL', // Set clientId to NULL if the associated client is deleted
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'clientId');
    },
};
