'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Clients', 'rfc', {
            type: Sequelize.STRING,
            allowNull: false, // Allow NULL for existing data; set to false if all users should have a client
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Clients', 'rfc');
    },
};
