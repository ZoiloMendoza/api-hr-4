'use strict';

module.exports = (sequelize, DataTypes) => {
    class Auditlog extends helpers.CRUDModel {
        static associate(models) {
            Auditlog.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
        }
    }

    Auditlog.init(
        {
            entityName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            entityId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            oldData: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            newData: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Auditlog',
        },
    );
    return Auditlog;
};
