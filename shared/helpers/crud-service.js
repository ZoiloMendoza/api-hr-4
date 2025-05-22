const BaseService = require('./base-service');
const { EntityNotFoundError } = require('./entity-errors');
const { DataTypes, Op, Utils } = require('sequelize');
const entityErrors = require('./entity-errors');
const { translateAST } = require('./sequelize-query');

class CRUDService extends BaseService {
    jsonMethods = {};
    relations = {};

    constructor(model) {
        super(model.name.toLowerCase());
        this.model = model;
        this.modelName = model.name.toLowerCase();
        this.hasCompany = this.model.rawAttributes.companyId !== undefined;
        this.addJsonMethods();
    }

    async query(q) {
        try {
            let sq = translateAST(q, this.model);
            return await this.model.findAll(sq);
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    addRelation(OtherModel, fields) {
        const otherModelName = Utils.pluralize(OtherModel.name);
        const otherModelNameSingular = OtherModel.name;

        logger.info(`Adding relation from ${this.model.name} to ${otherModelName}`);

        if (this.relations[otherModelName]) {
            throw new Error('Relation already added');
        }
        for (let association of Object.values(this.model.associations)) {
            if (association.target === OtherModel) {
                this.relations[otherModelName] = association;

                logger.info(`Relation found: ${association.associationType}`);
                switch (association.associationType) {
                    case 'BelongsToMany': //Relacion de Muchos a Muchos
                        logger.info(`Adding method assign${otherModelName}`);
                        this[`assign${otherModelName}`] = this.getAddRelatedList(OtherModel, fields);
                        logger.info(`Adding method remove${otherModelName}`);
                        this[`remove${otherModelName}`] = this.getRemoveRelatedList(OtherModel, fields);
                        logger.info(`Adding method related${otherModelName}`);
                        this[`related${otherModelName}ids`] = this.getRelatedIds(OtherModel);
                        return association;
                    case 'HasOne': //Relacion de Uno a Uno
                        this[`related${otherModelNameSingular}entity`] = this.getRelatedEntity(OtherModel);
                        return association;
                    case 'BelongsTo': //Relacion de Muchos a Uno
                        logger.info(`Adding method related${otherModelName}`);
                        this[`related${otherModelName}entity`] = this.getRelatedEntity(OtherModel);
                        return association;
                    case 'HasMany': //Relacion de Uno a Muchos
                        this[`related${otherModelNameSingular}list`] = this.getRelatedList(OtherModel);
                        return association;
                    default:
                        throw new Error('Relation not supported' + association.associationType);
                }
            }
        }
        throw new Error('Relation not found');
    }

    addJsonMethods() {
        for (const [field, definition] of Object.entries(this.model.rawAttributes)) {
            if (definition.type.key == DataTypes.JSON.key) {
                logger.info(`Adding JSON methods for ${field}`);
            }
        }
    }

    getModelName() {
        return this.modelName;
    }

    toJson(entity) {
        const json = entity.toJSON();
        delete json.companyId;
        delete json.active;
        delete json.createdAt;
        delete json.updatedAt;
        return json;
    }

    async create(data) {
        const getLoggedUser = this.getLoggedUser();
        if (this.hasCompany) {
            data.companyId = getLoggedUser.company.id;
        }
        try {
            const createdRecord = await this.model.create(data);
            return this.toJson(createdRecord);
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    async findAndCountAll(options = {}) {
        const loggedUser = this.getLoggedUser();
        let f = {};
        if (options.filter) {
            f = options.filter;
        }
        let translation = translateAST(f, this.model);

        options.where = translation.where;

        //Inject company condition
        if (this.hasCompany) {
            options.where.companyId = loggedUser.company.id;
        }
        try {
            const records = await this.model.findAndCountAll(options);
            records.rows = records.rows.map((item) => this.toJson(item));
            return records;
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    async findAndCountAllWithExclusions(options = {}, exclusions = []) {
        const loggedUser = this.getLoggedUser();
        let f = {};
        if (options.filter) {
            f = options.filter;
        }

        let translation = translateAST(f, this.model);

        options.where = {
            ...translation.where,
            ...options.where,
        };

        if (exclusions.length > 0) {
            options.where.id = { [Op.notIn]: exclusions };
        }

        if (this.hasCompany) {
            options.where.companyId = loggedUser.company.id;
        }

        try {
            const records = await this.model.findAndCountAll(options);
            records.rows = records.rows.map((item) => this.toJson(item));
            return records;
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    async findAndCountAllWithInclude(options = {}) {
        const loggedUser = this.getLoggedUser();

        let f = options.filter || {};
        let translation = translateAST(f, this.model);

        const where = { ...translation.where };
        if (this.hasCompany) {
            where.companyId = loggedUser.company.id;
        }

        const findOpts = {
            where,
            include: options.include || [],
            offset: options.offset,
            limit: options.limit,
            order: options.order,
        };

        try {
            const records = await this.model.findAndCountAll(findOpts);
            records.rows = records.rows.map((item) => this.toJson(item));
            return records;
        } catch (err) {
            logger.debug(err);
            throw err;
        }
    }

    async findAndCountAllCustom(options = {}, exclusions = []) {
        const loggedUser = this.getLoggedUser();

        // Procesar filtros personalizados
        let f = options.filter || {};
        let translation = translateAST(f, this.model);

        // Combinar filtros y condiciones adicionales
        options.where = {
            ...translation.where,
            ...options.where,
        };

        // Excluir registros específicos si se proporcionan
        if (exclusions.length > 0) {
            options.where.id = { [Op.notIn]: exclusions };
        }

        // Incluir condición de compañía si aplica
        if (this.hasCompany) {
            options.where.companyId = loggedUser.company.id;
        }

        // Configurar opciones de búsqueda
        const findOpts = {
            where: options.where,
            include: options.include || [],
            offset: options.offset,
            limit: options.limit,
            order: options.order,
        };

        try {
            // Ejecutar la consulta
            const records = await this.model.findAndCountAll(findOpts);
            records.rows = records.rows.map((item) => this.toJson(item));
            return records;
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    async findAll(options = {}) {
        const loggedUser = this.getLoggedUser();
        //Inject company condition
        if (!options.where) {
            options.where = {};
        }
        options.where.active = true;
        if (this.hasCompany) {
            options.where.companyId = loggedUser.company.id;
        }
        try {
            const records = await this.model.findAll(options);
            return records.map((item) => this.toJson(item));
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    async _readById(id) {
        const loggedUser = this.getLoggedUser();
        //Inject company condition

        try {
            const where = { id, active: true };
            if (this.hasCompany) {
                where.companyId = loggedUser.company.id;
            }
            const record = await this.model.findOne({
                where,
            });
            if (!record) {
                throw new EntityNotFoundError(i18n.__('entity not found', this.getModelName()));
            }
            /*if (this.hasCompany) {
                if (record.companyId !== loggedUser.company.id) {
                    throw new EntityNotFoundError(
                        i18n.__('entity not found', this.getModelName()),
                    );
                }
            }*/
            return record;
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    async readById(id) {
        let result = await this._readById(id);
        return this.toJson(result);
    }

    async update(id, data) {
        const loggedUser = this.getLoggedUser();
        //Inject company condition
        if (this.hasCompany) {
            data.companyId = loggedUser.company.id;
        }
        //here
        try {
            const record = await this._readById(id);
            await record.update(data);
            const updatedRecord = await this._readById(id);
            return this.toJson(updatedRecord);
        } catch (error) {
            console.debug(error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const record = await this._readById(id);
            record.active = false;
            await record.save();
            return this.toJson(record);
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    getRemoveRelatedList(relatedModel, fields) {
        const relatedModelName = Utils.pluralize(relatedModel.name);

        const assoc = Object.values(this.model.associations).find((a) => a.target === relatedModel);

        if (!assoc) {
            throw new Error(`No association found for ${relatedModel.name}`);
        }

        const includeOpts = {
            model: relatedModel,
            as: assoc.as, // FIX
            attributes: ['id'].concat(fields),
            where: {},
            through: { attributes: [] },
        };

        let result = async (id, lookup) => {
            if (lookup.length === 0) {
                throw new Error(i18n.__('No elements to add'));
            }
            const loggedUser = this.getLoggedUser();
            const whereM = { id: id, active: true };
            if (this.hasCompany) {
                whereM.companyId = loggedUser.company.id;
            }
            const relatedHasCompany = relatedModel.rawAttributes.companyId !== undefined;
            const whereR = { active: true };
            if (relatedHasCompany) {
                whereR.companyId = loggedUser.company.id;
            }
            try {
                includeOpts.where = whereR;
                const elem = await this.model.findOne({
                    where: whereM,
                    include: [includeOpts],
                });
                if (!elem) {
                    throw new entityErrors.EntityNotFoundError(
                        i18n.__('entity not found', `${this.getModelName()} ${id}`),
                    );
                }

                const whereRl = { [Op.or]: lookup };
                whereRl.active = true;
                if (relatedHasCompany) {
                    whereRl.companyId = loggedUser.company.id;
                }

                const relatedElems = await relatedModel.findAll({
                    where: whereRl,
                });

                if (relatedElems.length !== lookup[0].length) {
                    // Extract the "name" field from each object in the array
                    const allElements = relatedElems.map((obj) => {
                        let res = '(';
                        for (const field of fields) {
                            res += obj[field] + ' ';
                        }
                        return res + ')';
                    });

                    const neededElements = lookup.map((obj) => {
                        let res = '(';
                        for (const field of fields) {
                            res += obj[field] + ' ';
                        }
                        return res + ')';
                    });

                    // Find strings that are not in the object names
                    const missingElements = neededElements.filter((str) => !allElements.includes(str));
                    if (missingElements.length > 0) {
                        throw new entityErrors.EntityNotFoundError(
                            i18n.__('missing entities', relatedModelName, missingElements.join(',')),
                        );
                    }
                }
                const toRemove = [];

                for (const relElem of relatedElems) {
                    if (
                        !elem[assoc.as].some((obj) => {
                            for (let f of fields) {
                                if (obj[f] !== relElem[f]) {
                                    return false;
                                }
                            }
                            return true;
                        })
                    ) {
                        const e = fields.reduce((obj, key) => {
                            if (!obj.txt) obj.txt = '';
                            if (key in relElem) obj.txt += ` ${relElem[key]}`;
                            return obj;
                        }, {});
                        throw new entityErrors.EntityNotFoundError(i18n.__('not associated', relatedModelName, e.txt));
                    }
                    toRemove.push(relElem);
                }
                await elem[`remove${relatedModelName}`](toRemove);

                await elem.reload({
                    include: [includeOpts],
                });

                return this.toJson(elem);
            } catch (error) {
                logger.error(i18n.__('generic error', error.toString()));
                throw error;
            }
        };

        return result;
    }

    getAddRelatedList(relatedModel, fields) {
        const relatedModelName = Utils.pluralize(relatedModel.name);

        const assoc = Object.values(this.model.associations).find((a) => a.target === relatedModel);

        if (!assoc) {
            throw new Error(`No association found for ${relatedModel.name}`);
        }

        const includeOpts = {
            association: assoc,
            attributes: ['id'].concat(fields),
            where: {},
            through: { attributes: [] },
        };

        let result = async (id, lookup) => {
            if (lookup.length === 0) {
                throw new Error(i18n.__('No elements to add'));
            }
            const loggedUser = this.getLoggedUser();
            const whereM = { id: id, active: true };
            if (this.hasCompany) {
                whereM.companyId = loggedUser.company.id;
            }
            const relatedHasCompany = relatedModel.rawAttributes.companyId !== undefined;
            const whereR = { active: true };
            if (relatedHasCompany) {
                whereR.companyId = loggedUser.company.id;
            }
            try {
                includeOpts.where = whereR;
                const elem = await this.model.findOne({
                    where: whereM,
                    include: [includeOpts],
                });
                if (!elem) {
                    throw new entityErrors.EntityNotFoundError(
                        i18n.__('entity not found', `${this.getModelName()} ${id}`),
                    );
                }
                const whereRl = { [Op.or]: lookup };
                whereRl.active = true;
                if (relatedHasCompany) {
                    whereRl.companyId = loggedUser.company.id;
                }

                const relatedElems = await relatedModel.findAll({
                    where: whereRl,
                });
                if (relatedElems.length !== lookup[0].length) {
                    // Extract the "name" field from each object in the array
                    const allElements = relatedElems.map((obj) => {
                        let res = '(';
                        for (const field of fields) {
                            res += obj[field] + ' ';
                        }
                        return res + ')';
                    });

                    const neededElements = lookup.map((obj) => {
                        let res = '(';
                        for (const field of fields) {
                            res += obj[field] + ' ';
                        }
                        return res + ')';
                    });

                    // Find strings that are not in the object names
                    const missingElements = neededElements.filter((str) => !allElements.includes(str));
                    if (missingElements.length > 0) {
                        throw new entityErrors.EntityNotFoundError(
                            i18n.__('missing entities', relatedModelName, missingElements.join(',')),
                        );
                    }
                }

                for (const relElem of relatedElems) {
                    // check for duplicates
                    /*if (elem.Roles.some(obj => obj.name === role.name)) {
                         throw new entityErrors.DuplicateEntityError(i18n.__('duplicate role', role.name)); 
                    }*/
                    await elem[`add${relatedModelName}`](relatedElems);
                }
                await elem.reload({ include: [includeOpts] });

                return this.toJson(elem);
            } catch (error) {
                logger.error(i18n.__('generic error', error.toString()));
                throw error;
            }
        };
        return result;
    }

    getRelatedIds(relatedModel) {
        const assoc = Object.values(this.model.associations).find((a) => a.target === relatedModel);

        if (!assoc) {
            throw new Error(`No association found for ${relatedModel.name}`);
        }

        let result = async (id) => {
            const loggedUser = this.getLoggedUser();
            const whereM = { id: id, active: true };
            if (this.hasCompany) {
                whereM.companyId = loggedUser.company.id;
            }
            try {
                const elem = await this.model.findOne({
                    where: whereM,
                    include: [
                        {
                            model: relatedModel,
                            as: assoc.as,
                            attributes: ['id'],
                            through: { attributes: [] },
                        },
                    ],
                });

                if (!elem) {
                    throw new entityErrors.EntityNotFoundError(
                        i18n.__('entity not found', `${this.getModelName()} ${id}`),
                    );
                }

                const relatedIds = elem[assoc.as].map((relElem) => relElem.id);

                return relatedIds;
            } catch (error) {
                logger.error(i18n.__('generic error', error.toString()));
                throw error;
            }
        };

        return result;
    }

    getRelatedList(relatedModel) {
        const assoc = Object.values(this.model.associations).find(
            (a) => a.target === relatedModel || a.as === relatedModel.name.toLowerCase(),
        );
        if (!assoc) {
            throw new Error(`No association found for ${relatedModel.name}`);
        }

        logger.info(`234  assoc.as  ${assoc.as}`);

        let result = async (id) => {
            const loggedUser = this.getLoggedUser();
            const whereM = { id: id, active: true };
            if (this.hasCompany) {
                whereM.companyId = loggedUser.company.id;
            }
            try {
                const whereCondition = {
                    active: true,
                };
                const elem = await this.model.findOne({
                    where: whereM,
                    include: [
                        {
                            model: relatedModel,
                            as: assoc.as,
                            attributes: ['id', 'name'],
                            where: whereCondition,
                        },
                    ],
                });

                if (!elem) {
                    throw new entityErrors.EntityNotFoundError(
                        i18n.__('entity not found', `${this.getModelName()} ${id}`),
                    );
                }

                return elem[assoc.as];
            } catch (error) {
                logger.error(i18n.__('generic error', error.toString()));
                throw error;
            }
        };

        return result;
    }

    getRelatedEntity(relatedModel) {
        const assocs = Object.values(this.model.associations).filter((a) => a.target === relatedModel);
        if (assocs.length === 0) {
            throw new Error(`No associations found for ${relatedModel.name}`);
        }

        let result = async (id) => {
            const loggedUser = this.getLoggedUser();
            const whereM = { id: id, active: true };
            if (this.hasCompany) {
                whereM.companyId = loggedUser.company.id;
            }
            try {
                const elem = await this.model.findOne({
                    where: whereM,
                    attributes: { exclude: ['active', 'createdAt', 'updatedAt', 'companyId'] },
                    include: assocs.map((assoc) => ({
                        model: relatedModel,
                        as: assoc.as,
                        attributes: { exclude: ['active', 'createdAt', 'updatedAt', 'companyId'] },
                    })),
                });

                if (!elem) {
                    throw new entityErrors.EntityNotFoundError(
                        i18n.__('entity not found', `${this.getModelName()} ${id}`),
                    );
                }

                return elem;
            } catch (error) {
                logger.error(i18n.__('generic error', error.toString()));
                throw error;
            }
        };

        return result;
    }
}

module.exports = CRUDService;
