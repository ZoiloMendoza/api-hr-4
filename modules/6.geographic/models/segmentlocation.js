'use strict';
module.exports = (sequelize, DataTypes) => {
    class SegmentLocation extends helpers.CRUDModel {
        static associate(models) {
            SegmentLocation.belongsTo(models.segment, {
                foreignKey: 'segmentId',
                as: 'segment',
            });
            SegmentLocation.belongsTo(models.location, {
                foreignKey: 'locationId',
                as: 'location',
            });
        }
    }

    SegmentLocation.init(
        {
            segmentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            locationId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            orderIndex: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'SegmentLocation',
        },
    );

    return SegmentLocation;
};
