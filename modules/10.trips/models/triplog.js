'use strict';

module.exports = (sequelize, DataTypes) => {
    class TripLog extends helpers.CRUDModel {
        static associate(models) {
            TripLog.belongsTo(models.trip, {
                foreignKey: 'tripId',
                as: 'trip',
            });
        }
    }

    TripLog.init(
        {
            tripId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Trips',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            statusUpdatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'TripLog',
        },
    );

    return TripLog;
};
