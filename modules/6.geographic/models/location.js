const { CrudJsonType } = helpers;
const Joi = require('joi');
module.exports = (sequelize, DataTypes) => {
    class Location extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Location.hasMany(models.segment, {
                foreignKey: 'origin',
                as: 'originSegments',
            });
            Location.hasMany(models.segment, {
                foreignKey: 'destination',
                as: 'destinationSegments',
            });
            Location.belongsToMany(models.segment, {
                through: 'SegmentLocation',
                foreignKey: 'locationId',
                otherKey: 'segmentId',
                as: 'segments',
            });
        }
    }

    Location.init(
        {
            directionN3: {
                type: DataTypes.STRING,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
            },
            lat: {
                type: DataTypes.DECIMAL(10, 8),
            },
            lng: {
                type: DataTypes.DECIMAL(11, 8),
            },
            routingLineId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            routingSourceId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            routingTargetId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            roadName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            nearestPointGeoString: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            scale: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            value: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Location',
        },
    );

    return Location;
};
