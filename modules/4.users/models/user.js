'use strict';
module.exports = (sequelize, DataTypes) => {
    class User extends helpers.CRUDModel {
        static associate(models) {
            User.belongsToMany(models.role, {
                through: 'UserRole',
                foreignKey: 'userId',
                otherKey: 'roleId',
                as: 'roles'
            });
            User.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });
            User.belongsTo(models.client, {
                foreignKey: 'clientId',
                as: 'client',
            });
            User.hasOne(models.employee, {
                foreignKey: 'userId',
                as: 'employee',
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
