const { CrudJsonType } = helpers;
const Joi = require('joi');

module.exports = (sequelize, DataTypes) => {
    class EvidenceType extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            EvidenceType.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });
            EvidenceType.hasMany(models.evidence, {
                foreignKey: 'evidenceTypeId',
                as: 'evidences',
            });
        }
    }

    EvidenceType.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            actions: {
                type: new CrudJsonType(models.action, true),
                validate: {
                    isValidActionsArray(value) {
                        const validatorSchema = Joi.array().items(validators.action.schema);

                        const { error } = validatorSchema.validate(value, {
                            abortEarly: false,
                        });
                        if (error) {
                            throw new Error(`${error.message}`);
                        }
                    },
                },
                defaultValue: [],
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'EvidenceType',
        },
    );

    return EvidenceType;
};
