'use strict';

module.exports = (sequelize, DataTypes) => {
    class EvidencePhoto extends helpers.CRUDModel {
        static associate(models) {
            // Asociación con Evidence
            EvidencePhoto.belongsTo(models.evidence, {
                foreignKey: 'evidenceId',
                as: 'evidence',
            });
        }
    }

    EvidencePhoto.init(
        {
            evidenceId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Evidences',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            actionRefId: {
                type: DataTypes.STRING,
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
            modelName: 'EvidencePhoto',
        },
    );

    return EvidencePhoto;
};
