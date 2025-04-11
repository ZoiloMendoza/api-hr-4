'use strict';
module.exports = (sequelize, DataTypes) => {
    class RouteSegment extends helpers.CRUDModel {
        static associate(models) {
            RouteSegment.belongsTo(models.route, {
                foreignKey: 'routeId',
                as: 'route',
            });
            RouteSegment.belongsTo(models.segment, {
                foreignKey: 'segmentId',
                as: 'segment',
            });
        }
    }

    RouteSegment.init(
        {
            routeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            segmentId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            orderIndex: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'RouteSegment',
        },
    );

    return RouteSegment;
};
