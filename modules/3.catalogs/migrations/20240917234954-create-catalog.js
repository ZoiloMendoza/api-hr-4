'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Catalogs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
            },
            value: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            description: {
                type: Sequelize.STRING,
            },
            type: {
                type: Sequelize.STRING,
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            companyId: {
                type: Sequelize.INTEGER,
                allowNull: false,
		references: {
          		model: 'Companies',
          		key: 'id',
        	},
        	onUpdate: 'CASCADE',
        	onDelete: 'CASCADE',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Catalogs');
    },
};
