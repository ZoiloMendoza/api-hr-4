'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                //TODO unique
            },
            fullname: {
                type: Sequelize.STRING,
            },
            password: {
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
          		model: 'Companies', // Name of the target table
          		key: 'id', // Key in the target table that we're referencing
        	},
        	onUpdate: 'CASCADE',
        	onDelete: 'CASCADE'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Users');
    },
};
