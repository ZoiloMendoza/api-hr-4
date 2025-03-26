const BaseService = require('./base-service');
const { EntityNotFoundError } = require('./entity-errors');
const { DataTypes, Op, Utils } = require('sequelize');
const entityErrors = require('./entity-errors');
const { translateAST } = require('./sequelize-query');

class CRUDService extends BaseService {

    jsonMethods = {}
    relations = {};

    constructor(model) {
        super(model.name.toLowerCase());
        this.model = model;
        this.modelName = model.name.toLowerCase();
        this.hasCompany = this.model.rawAttributes.companyId !== undefined;
        this.addJsonMethods()
    }

    async query(q) {
        try {
            let sq =  translateAST(q, this.model);
            return await this.model.findAll(sq);
        } catch (error) {
            logger.debug(error);
            throw error;
        }
    }

    addRelation(OtherModel, fields) {
        const otherModelName = Utils.pluralize(OtherModel.name);
        logger.info(`Adding relation from ${this.model.name} to ${otherModelName}`);
        if (this.relations[otherModelName]) {
            throw new Error('Relation already added');
        }
        for (let association of Object.values(this.model.associations)) {
            if (association.target === OtherModel) {
                this.relations[otherModelName] = association;

                logger.info(`Relation found: ${association.associationType}`);
                switch (association.associationType) {
                    case 'BelongsToMany':
                        logger.info(`Adding method assign${otherModelName}`);
                        this[`assign${otherModelName}`] = this.getAddRelatedList(OtherModel, fields);
                        logger.info(`Adding method remove${otherModelName}`);
                        this[`remove${otherModelName}`] = this.getRemoveRelatedList(OtherModel, fields);
                        return association;
                    default:
                        throw new Error('Relation not supported');
                };
            }
        };
        throw new Error('Relation not found');
    }
    
    addJsonMethods() {
        for (const [field, definition] of Object.entries(
            this.model.rawAttributes,
        )) {
            if(definition.type.key == DataTypes.JSON.key){
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
                throw new EntityNotFoundError(
                    i18n.__('entity not found', this.getModelName()),
                );
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
        let result = async(id, lookup) => {
            if (lookup.length === 0) {
                throw new Error( i18n.__('No elements to add'));
            }
            const loggedUser = this.getLoggedUser();
            const whereM = {id: id, active: true };
            if (this.hasCompany) {
                whereM.companyId = loggedUser.company.id;
            }
            const relatedHasCompany = relatedModel.rawAttributes.companyId !== undefined;
            const whereR = { active: true };
            if (relatedHasCompany) {
                whereR.companyId = loggedUser.company.id;
            }
            try {
                const elem = await this.model.findOne({
                    where: whereM,
                    include: [
                        {
                            model: relatedModel,
                            attributes: ['id'].concat(fields),
                            where: whereR,
                            through: { attributes: [] },
                        },
                    ],
                });
                if (!elem) {
                    throw new entityErrors.EntityNotFoundError(
                        i18n.__('entity not found', `${this.getModelName()} ${id}`),
                    );
                }

                const whereRl  = { [Op.or]: lookup};
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
                        let res  = '(';
                        for (const field of fields) {
                            res += obj[field] + ' ';
                        }
                        return res + ')';
                    });
    

                    const neededElements = lookup.map((obj) => {
                        let res  = '(';
                        for (const field of fields) {
                            res += obj[field] + ' ';
                        }
                        return res + ')';
                    });

                    // Find strings that are not in the object names
                    const missingElements = neededElements.filter(
                        (str) => !allElements.includes(str),
                    );
                    if (missingElements.length > 0) {
                        throw new entityErrors.EntityNotFoundError(
                            i18n.__('missing entities', relatedModelName, missingElements.join(',')),
                        );
                    }
                }
                const toRemove = [];
                for (const relElem of relatedElems) {
                    if (!elem[relatedModelName].some(obj => {
                        for (let f of fields) {
                            if (obj[f] !== relElem[f]) {
                                return false;
                            }
                        }
                        return true;
                    })) {
                        const e = fields.reduce((obj, key) => {
                            if (!obj.txt) obj.txt = '';
                            if (key in relElem) obj.txt += ` ${relElem[key]}`;
                            return obj;
                          }, {})
                        throw new entityErrors.EntityNotFoundError(i18n.__('not associated', relatedModelName, e.txt ));
                    }
                    toRemove.push(relElem);
                }
                await elem[`remove${relatedModelName}`](toRemove);
                
                await elem.reload({ include: [ {
                    model: relatedModel,
                    attributes: ['id'].concat(fields),
                    through: { attributes: [] }
                  }] });
                
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
        let result = async(id, lookup) => {
            if (lookup.length === 0) {
                throw new Error( i18n.__('No elements to add'));
            }
            const loggedUser = this.getLoggedUser();
            const whereM = {id: id, active: true };
            if (this.hasCompany) {
                whereM.companyId = loggedUser.company.id;
            }
            const relatedHasCompany = relatedModel.rawAttributes.companyId !== undefined;
            const whereR = { active: true };
            if (relatedHasCompany) {
                whereR.companyId = loggedUser.company.id;
            }
            try {
                const elem = await this.model.findOne({
                    where: whereM,
                    include: [
                        {
                            model: relatedModel,
                            attributes: ['id'].concat(fields),
                            where: whereR,
                            through: { attributes: [] },
                        },
                    ],
                });
                if (!elem) {
                    throw new entityErrors.EntityNotFoundError(
                        i18n.__('entity not found', `${this.getModelName()} ${id}`),
                    );
                }
                const whereRl  = { [Op.or]: lookup};
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
                        let res  = '(';
                        for (const field of fields) {
                            res += obj[field] + ' ';
                        }
                        return res + ')';
                    });
    

                    const neededElements = lookup.map((obj) => {
                        let res  = '(';
                        for (const field of fields) {
                            res += obj[field] + ' ';
                        }
                        return res + ')';
                    });

                    // Find strings that are not in the object names
                    const missingElements = neededElements.filter(
                        (str) => !allElements.includes(str),
                    );
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
                 await elem.reload({ include: [ {
                     model: relatedModel,
                     attributes: ['id'].concat(fields),
                     through: { attributes: [] }
                   }] });
                 
                 return this.toJson(elem);

            } catch (error) {
                logger.error(i18n.__('generic error', error.toString()));
                throw error;
            }
        };
        return result;

    }

}

module.exports = CRUDService;
