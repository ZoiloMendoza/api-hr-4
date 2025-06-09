'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('AuditLogs', 'active', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true, // Valor predeterminado
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('AuditLogs', 'active');
    },
};
