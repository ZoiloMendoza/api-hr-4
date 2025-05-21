'use strict';
module.exports = (sequelize, DataTypes) => {
    class Route extends helpers.CRUDModel {
        static associate(models) {
            Route.belongsToMany(models.segment, {
                through: 'RouteSegment',
                foreignKey: 'routeId',
                otherKey: 'segmentId',
                as: 'segments',
            });
            Route.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });
            Route.hasMany(models.trip, {
                foreignKey: 'routeId',
                as: 'trips', // Alias para acceder a los viajes relacionados
            });
        }
    }

    Route.init(
        {
            routeName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            alias: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            routeType: {
                type: DataTypes.STRING,
            },
            totalKm: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            mealsAmount: {
                //monto por comida
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            tollBoothsAmount: {
                //monto por casetas
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            lodgingAmount: {
                //monto por hospedaje
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            transitAmount: {
                //monto por transito
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            handlingAmount: {
                //monto por maniobras
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            fuelAmount: {
                //monto por combustible
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            routeSalary: {
                //Sueldo por ruta
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Route',
        },
    );
    return Route;
};
