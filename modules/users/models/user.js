'use strict';
module.exports = (sequelize, DataTypes) => {
    class User extends helpers.CRUDModel {
        static associate(models) {
            User.belongsToMany(models.Role, {
                through: 'UserRole',
                foreignKey: 'userId',
                otherKey: 'roleId',
                as: 'roles'
            });
            User.belongsTo(models.Company, {
                foreignKey: 'companyId',
                as: 'company',
            });
            User.belongsTo(models.Client, {
                foreignKey: 'clientId',
                as: 'client',
            });
        }
    }
    User.init(
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            fullname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            clientId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'User',
        },
    );
    return User;
};
