'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Employees', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            rfc: {
                type: Sequelize.STRING,
                unique: true,
            },
            firstName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phoneMobile: {
                type: Sequelize.STRING,
            },
            phoneOffice: {
                type: Sequelize.STRING,
            },
            addresses: {
                type: Sequelize.JSON,
                validate: {
                    isValidAddressesArray(value) {
                        const validator = validators.address;
                        const { error } = validator.schema.validate(value, {
                            abortEarly: false,
                        });
                        if (error) {
                            throw new Error(
                                `Address validation failed: ${error.message}`,
                            );
                        }
                    },
                },
                defaultValue: [],
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
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
        await queryInterface.dropTable('Employees');
    },
};
