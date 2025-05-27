'use strict';

module.exports = (sequelize, DataTypes) => {
    class Evidence extends helpers.CRUDModel {
        static associate(models) {
            // Asociación con EvidenceType
            Evidence.belongsTo(models.evidencetype, {
                foreignKey: 'evidenceTypeId',
                as: 'evidenceType',
            });

            // Asociación con Trip
            Evidence.belongsTo(models.trip, {
                foreignKey: 'tripId',
                as: 'trip',
            });
        }
    }

    Evidence.init(
        {
            evidenceTypeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'EvidenceTypes',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
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
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            tableName: 'evidences',
            modelName: 'Evidence',
        },
    );

    return Evidence;
};
