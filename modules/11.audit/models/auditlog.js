'use strict';

module.exports = (sequelize, DataTypes) => {
    class Auditlog extends helpers.CRUDModel {
        static associate(models) {
            Auditlog.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });

            Auditlog.belongsTo(models.company, { foreignKey: 'companyId', as: 'company' });
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
            username: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Companies',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Auditlog',
            tableName: 'AuditLogs',
        },
    );
    return Auditlog;
};
