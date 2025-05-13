const SearchResult = require('./search-result');
const CRUDParser = require('./crud-parser');
const entityErrors = require('./entity-errors');
const { Utils, Op } = require('sequelize');
const SequelizeValidator = require('./sequelizeValidator');

const BaseController = require('./base-controller');
class CRUDController extends BaseController {
    service = null;
    model = null;
    modelName = null;
    parser = null;

    constructor(model, role = null) {
        super();
        this.model = model;
        this.modelName = model.name.toLowerCase();

        this.service = services[this.modelName + 'Service'];
        this.parser = new CRUDParser(model);

        this.setValidator(validators[this.modelName]);
        if (!role) {
            role = this.modelName.toUpperCase() + '_ADMON';
        } else {
            role = process.env.SYSADMIN_ROLE;
        }
        this.setNeededRole(role);
        this.configApp();
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    addRelation(OtherModel, fields, fieldRelation = null) {
        //create validator for fields
        const relation = this.service.addRelation(OtherModel, fields);
        const otherModelName = Utils.pluralize(OtherModel.name.toLowerCase());
        const otherNamePlural = Utils.pluralize(OtherModel.name.toLowerCase());
        const otherNameSingular = OtherModel.name.toLowerCase();

        const methodNamePUT = `assign${this.capitalize(otherModelName)}`; //FIX
        const methodNameDELETE = `remove${this.capitalize(otherModelName)}`; //FIX
        const methodNameGET = `related${this.capitalize(otherModelName)}ids`; //FIX
        // const methodNameGETList = `related${otherModelName}list`;
        const methodNameGETEntity = `related${this.capitalize(otherModelName)}entity`; //FIX

        // const listMethod = `related${this.capitalize(otherNameSingular)}List`;
        // const detailMethod = `related${this.capitalize(otherNameSingular)}Detail`;
        // const entityMethod = `related${this.capitalize(otherNameSingular)}entity`;
        // const idsMethod = `related${this.capitalize(otherNamePlural)}Ids`;
        // const addMethod = `assign${this.capitalize(otherNamePlural)}`;
        // const removeMethod = `remove${this.capitalize(otherNamePlural)}`;

        let multiple = relation.associationType === 'BelongsToMany' || relation.associationType === 'HasMany';
        let validator = new SequelizeValidator(OtherModel, fields, multiple);

        switch (relation.associationType) {
            case 'HasMany':
                // // GET /model/:id/other — lista
                // this.validateRoute('get', `/${this.modelName}/:id/${otherNamePlural}`, (req, res, next) => next());
                // this.addRoute('get', `/${this.modelName}/:id/${otherNamePlural}`, async (req, res) => {
                //     const { id } = req.params;
                //     const data = await this.service[listMethod](id, {
                //         offset: req.query.start,
                //         limit: req.query.limit,a
                //         where: req.query.filter
                //     });
                //     return res.json(data);
                // });
                // // GET /model/:id/other/:childId — detalle
                // this.validateRoute('get', `/${this.modelName}/:id/${otherNamePlural}/:childId`, (req, res, next) => next());
                // this.addRoute('get', `/${this.modelName}/:id/${otherNamePlural}/:childId`, async (req, res) => {
                //     const { id, childId } = req.params;
                //     const data = await this.service[detailMethod](id, childId);
                //     return res.json(data);
                // });
                break;

            case 'HasOne': //Relacion de Uno a Uno
                this.validateRoute('get', `/${this.modelName}s/${otherNamePlural}`, (req, res, next) => next());
                this.addRoute('get', `/${this.modelName}s/${otherNamePlural}`, async (req, res) => {
                    logger.info(`Querying related ${this.modelName} for ${otherModelName}`);
                    let q;
                    try {
                        q = this.parser.parse(req.query);
                    } catch (error) {
                        return res.status(400).json([req.__('Invalid query')]);
                    }
                    if (q.start < 0 || q.limit <= 0) {
                        return res.status(400).json();
                    }

                    const assoc = Object.values(this.model.associations)
                        .find(a => a.target === OtherModel);
                    if (!assoc) {
                        return res.status(400).json([req.__('No association found for the related model')]);
                    }

                    const includeOpts = {
                        model: OtherModel,
                        as: assoc.as,
                        attributes: { exclude: ['active', 'createdAt', 'updatedAt'] },
                        where: { active: true },
                        required: false
                    };

                    try {
                        const { rows, count } = await this.service.findAndCountAllWithInclude({
                            include: [includeOpts],
                            offset: q.start,
                            limit: q.limit,
                            order: [[q.orderBy, q.order]],
                            filter: q.filter
                        });

                        if (!rows.length) {
                            return res.status(404).json([req.__('No hay elementos relacionados')]);
                        }

                        const data = rows.map(emp => {
                            const opData = emp[assoc.as];
                            const empData = { ...emp };
                            delete empData[assoc.as];
                            return {
                                ...empData,
                                [assoc.as]: opData
                            };
                        });
                        return res.json(new SearchResult(data, q.start + 1, q.limit, count));
                    } catch (error) {
                        return this.throwError(error, req, res);
                    }

                })
                break;
            case 'BelongsTo':

                this.validateRoute('get', `/${this.modelName}/:id/${otherNameSingular}`, (req, res, next) => {
                    next();
                });
                this.addRoute('get', `/${this.modelName}/:id/${otherNameSingular}`, async (req, res) => {
                    logger.info(`Querying related ${otherModelName} for ${this.modelName} ${req.params.id}`);
                    const id = req.params.id;
                    try {
                        const elem = await this.service[methodNameGETEntity](id);
                        return res.json(elem);
                    } catch (error) {
                        if (error instanceof entityErrors.EntityNotFoundError) {
                            return res.status(404).json([error.message]);
                        }
                        return res.status(501).json([error.message]);
                    }
                });
                this.validateRoute('get', `/${this.modelName}s/${otherNamePlural}`, (req, res, next) => {
                    next();
                });
                this.addRoute('get', `/${this.modelName}s/${otherNamePlural}`, async (req, res) => {
                    logger.info(`Listing ${this.modelName} with nested ${otherNamePlural}`);
                    let q;
                    try {
                        q = this.parser.parse(req.query);
                    } catch {
                        return res.status(400).json([req.__('Invalid query')]);
                    }
                    if (q.start < 0 || q.limit <= 0) {
                        return res.status(400).json();
                    }

                    // 3) Encontrar la asociación Operator.belongsTo(Employee)
                    const assoc = Object.values(this.service.model.associations)
                        .find(a => a.target.name.toLowerCase() === OtherModel.name.toLowerCase());
                    if (!assoc) {
                        return res.status(400).json([req.__('No association found')]);
                    }

                    // 4) Configurar include para Sequelize
                    const includeOpts = {
                        model: OtherModel,
                        as: assoc.as,
                        attributes: { exclude: ['active', 'createdAt', 'updatedAt'] },
                        where: { active: true },
                        required: false
                    };

                    try {
                        // 5) Llamar al service de Operator con include + filter + paginación
                        const { rows, count } = await this.service.findAndCountAllWithInclude({
                            include: [includeOpts],
                            offset: q.start,
                            limit: q.limit,
                            order: [[q.orderBy, q.order]],
                            filter: q.filter
                        });

                        if (!rows.length) {
                            return res.status(404).json([req.__('No hay operadores')]);
                        }

                        // 6) Aplanar respuesta: Operator al root, Employee en 'employee'
                        const data = rows.map(op => {
                            const empData = op[assoc.as];    // ya es plain object
                            const opData = { ...op };
                            delete opData[assoc.as];
                            return {
                                ...opData,
                                [assoc.as]: empData
                            };
                        });

                        // 7) Devolver paginación igual que addGet
                        return res.json(new SearchResult(data, q.start + 1, q.limit, count));
                    } catch (err) {
                        return this.throwError(err, req, res);
                    }
                });
                break;
            case 'BelongsToMany':
                this.validateRoute('put', `/${this.modelName}/:id/${otherModelName}`, validator.genValidator());
                this.validateRoute('delete', `/${this.modelName}/:id/${otherModelName}`, validator.genValidator());
                this.validateRoute('get', `/${this.modelName}/:id/${otherModelName}/unrelated`, (req, res, next) => {
                    next();
                });

                this.addRoute('put', `/${this.modelName}/:id/${otherModelName}`, async (req, res) => {
                    logger.info(`Adding ${otherModelName} to ${this.modelName} ${req.params.id}`);
                    const id = req.params.id;
                    try {
                        //ERROR: ej. se enviva assignsegment y esperaba assignSegment
                        const elem = await this.service[methodNamePUT](id, req.input);
                        return res.json(elem);
                    } catch (error) {
                        if (error instanceof entityErrors.EntityNotFoundError) {
                            return res.status(404).json([error.message]);
                        }
                        if (error instanceof entityErrors.UnauthorizedError) {
                            return res.status(401).json([error.message]);
                        }
                        return res.status(501).json([error.message]);
                    }
                });
                this.addRoute('delete', `/${this.modelName}/:id/${otherModelName}`, async (req, res) => {
                    logger.info(`Deleting ${otherModelName} from ${this.modelName} ${req.params.id}`);
                    const id = req.params.id;
                    try {
                        const elem = await this.service[methodNameDELETE](id, req.input);
                        return res.json(elem);
                    } catch (error) {
                        res.status(500).json([error.message]);
                    }
                });
                this.addRoute('get', `/${this.modelName}/:id/${otherModelName}/unrelated`, async (req, res) => {
                    logger.info(`Querying unrelated ${otherModelName} to ${this.modelName} ${req.params.id}`);
                    const id = req.params.id;
                    this.parser2 = new CRUDParser(OtherModel);
                    let q = null;
                    try {
                        logger.info(`Raw req.query: ${JSON.stringify(req.query, null, 2)}`);

                        const normalizedQuery = {
                            start: req.query.start || '1',
                            limit: req.query.limit || '100',
                            q: req.query.q || '',
                            order: req.query.order || 'ASC',
                            orderBy: req.query.orderBy || 'id',
                        };

                        q = this.parser2.parse(normalizedQuery);
                    } catch (error) {
                        return res.status(400).json(req.__('Invalid query'));
                    }

                    if (q.start < 0 || q.limit <= 0) {
                        return res.status(400).json();
                    }

                    try {
                        const relatedIds = await this.service[methodNameGET](id);

                        const relatedService = services[OtherModel.name.toLowerCase() + 'Service'];
                        if (!relatedService) {
                            throw new Error(`Service for ${OtherModel.name} not found`);
                        }

                        const items = await relatedService.findAndCountAllWithExclusions(
                            {
                                offset: q.start,
                                limit: q.limit,
                                filter: q.filter,
                                order: [[q.orderBy, q.order]],
                            },
                            relatedIds,
                        );

                        return res.json(new SearchResult(items.rows, q.start + 1, q.limit, items.count));
                    } catch (error) {
                        return this.throwError(error, req, res);
                    }
                });
                break;
            default:
                throw new Error('Relation not supported: ' + relation.associationType);

        }


        // if (relation.associationType === 'HasMany') {
        //     this.validateRoute('get', `/${this.modelName}/:id/${otherModelName}/list`, (req, res, next) => {
        //         next();
        //     });
        //     this.addRoute('get', `/${this.modelName}/:id/${otherModelName}/list`, async (req, res) => {
        //         logger.info(`Querying related ${otherModelName} for ${this.modelName} ${req.params.id}`);

        //         const id = req.params.id;
        //         this.parser3 = new CRUDParser(OtherModel);
        //         let q = null;
        //         try {
        //             const normalizedQuery = {
        //                 start: req.query.start || '1',
        //                 limit: req.query.limit || '100',
        //                 q: req.query.q || '',
        //                 order: req.query.order || 'ASC',
        //                 orderBy: req.query.orderBy || 'id',
        //             };

        //             q = this.parser3.parse(normalizedQuery);
        //         } catch (error) {
        //             return res.status(400).json(req.__('Invalid query'));
        //         }
        //         try {
        //             logger.info(`158 Adding method ${methodNameGETList} - id: ${id}`);
        //             //cambiar esto
        //             const whereCondition = {
        //                 [fieldRelation]: id,
        //                 active: true,
        //             };

        //             const relatedItems = await OtherModel.findAll({
        //                 where: whereCondition,
        //                 attributes: {
        //                     exclude: ['active', 'createdAt', 'updatedAt'],
        //                 },
        //                 offset: q.start,
        //                 limit: q.limit,
        //                 order: [[q.orderBy, q.order]],
        //             });

        //             if (!relatedItems || relatedItems.length === 0) {
        //                 return res.status(404).json([req.__('No hay elementos relacionados')]);
        //             }

        //             return res.json(new SearchResult(relatedItems, q.start + 1, q.limit, relatedItems.length));
        //         } catch (error) {
        //             return this.throwError(error, req, res);
        //         }
        //     });
        // }

        // if (relation.associationType === 'HasOne') {
        //     this.addRoute('get', `/${otherModelName}/${this.modelName}`, async (req, res) => {
        //         logger.info(`Querying related ${otherModelName} for ${this.modelName} ${req.params.id}`);

        //         const id = req.params.id;
        //         this.parser4 = new CRUDParser(OtherModel);
        //         let q = null;
        //         try {
        //             const normalizedQuery = {
        //                 start: req.query.start || '1',
        //                 limit: req.query.limit || '100',
        //                 q: req.query.q || '',
        //                 order: req.query.order || 'ASC',
        //                 orderBy: req.query.orderBy || 'id',
        //             };

        //             q = this.parser4.parse(normalizedQuery);
        //         } catch (error) {
        //             return res.status(400).json(req.__('Invalid query'));
        //         }
        //         try {
        //             logger.info(`158 Adding method ${methodNameGETList} - id: ${id}`);
        //             //cambiar esto

        //             const assoc = Object.values(this.model.associations).find(
        //                 (a) => a.target === OtherModel || a.as === Utils.pluralize(OtherModel.name.toLowerCase()),
        //             );

        //             if (!assoc) {
        //                 return res.status(400).json(req.__('No association found for the related model'));
        //             }
        //             const relatedData = await this.model.findAll({
        //                 attributes: {
        //                     exclude: ['active', 'createdAt', 'updatedAt', 'companyId'],
        //                 },
        //                 include: [
        //                     {
        //                         model: OtherModel,
        //                         as: assoc.as,
        //                         attributes: {
        //                             exclude: ['active', 'createdAt', 'updatedAt'],
        //                         },
        //                         where: { active: true },
        //                         required: true,
        //                     },
        //                 ],
        //                 offset: q.start,
        //                 limit: q.limit,
        //                 order: [[q.orderBy, q.order]],
        //             });

        //             if (!relatedData || relatedData.length === 0) {
        //                 return res.status(404).json([req.__('No hay elementos relacionados')]);
        //             }

        //             const response = relatedData.map((item) => {
        //                 const otherModelData = item[assoc.as]?.toJSON(); // Convierte OtherModel a un objeto plano
        //                 const modelNameData = item.toJSON(); // Convierte ModelName a un objeto plano

        //                 if (assoc.as in modelNameData) {
        //                     delete modelNameData[assoc.as];
        //                 }
        //                 return {
        //                     ...otherModelData, // Incluye los datos de OtherModel en la raíz
        //                     [this.modelName]: modelNameData, // Anida los datos de ModelName bajo el nombre del modelo principal
        //                 };
        //             });

        //             return res.json(new SearchResult(response, q.start + 1, q.limit, response.length));
        //         } catch (error) {
        //             return this.throwError(error, req, res);
        //         }
        //     });
        // }

        // if (relation.associationType === 'BelongsTo') {
        //     this.validateRoute('get', `/${this.modelName}/:id/${otherModelName}`, (req, res, next) => {
        //         next();
        //     });
        //     this.addRoute('get', `/${this.modelName}/:id/${otherModelName}`, async (req, res) => {
        //         logger.info(`Querying related ${otherModelName} for ${this.modelName} ${req.params.id}`);
        //         const id = req.params.id;
        //         try {
        //             const elem = await this.service[methodNameGETEntity](id);
        //             return res.json(elem);
        //         } catch (error) {
        //             if (error instanceof entityErrors.EntityNotFoundError) {
        //                 return res.status(404).json([error.message]);
        //             }
        //             return res.status(501).json([error.message]);
        //         }
        //     });
        // }
    }

    addGet() {
        this.addRoute('get', `/${Utils.pluralize(this.modelName)}`, async (req, res) => {
            logger.info(`Querying ${Utils.pluralize(this.modelName)}`);
            let q = null;
            try {
                logger.info(`115 get normal req-query q ${JSON.stringify(req.query, null, 2)}`);
                q = this.parser.parse(req.query);
            } catch (error) {
                return res.status(400).json(req.__('Invalid query'));
            }

            if (q.start < 0 || q.limit <= 0) {
                return res.status(400).json();
            }
            try {
                const items = await this.service.findAndCountAll({
                    offset: q.start,
                    limit: q.limit,
                    filter: q.filter,
                    order: [[q.orderBy, q.order]],
                });
                return res.json(new SearchResult(items.rows, q.start + 1, q.limit, items.count));
            } catch (error) {
                return this.throwError(error, req, res);
            }
        });
    }

    addGetOne() {
        this.addRoute('get', `/${this.modelName}/:id`, async (req, res) => {
            const id = req.params.id;
            try {
                const item = await this.service.readById(id);
                if (!item) {
                    return res.status(404).json();
                }
                return res.json(item);
            } catch (error) {
                return this.throwError(error, req, res);
            }
        });
    }

    addPost() {
        this.addRoute('post', `/${this.modelName}`, async (req, res) => {
            logger.info(`Creating ${this.modelName} ${req.input.name}`);
            try {
                const newItem = await this.service.create(req.input);
                return res.json(newItem);
            } catch (error) {
                return this.throwError(error, req, res);
            }
        });
    }

    addPut() {
        this.addRoute('put', `/${this.modelName}/:id`, async (req, res) => {
            logger.info(`Updating ${this.modelName} ${req.params.id}`);
            const id = req.params.id;
            try {
                let newEntity = await this.service.update(id, req.input);
                return res.json(newEntity);
            } catch (error) {
                return this.throwError(error, req, res);
            }
        });
    }

    addDelete() {
        this.addRoute('delete', `/${this.modelName}/:id`, async (req, res) => {
            logger.info(`Deleting ${this.modelName} ${req.params.id}`);
            const id = req.params.id;
            try {
                const toDel = await this.service.delete(id);
                if (!toDel) {
                    return res.status(404).json();
                }
                return res.json(toDel);
            } catch (error) {
                return this.throwError(error, req, res);
            }
        });
    }

    validateRouteWithJoi(op, route, schema) {
        this.validateRoute(op, route, (req, res, next) => {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
            });

            if (error) {
                return res.status(400).json(error.details.map((detail) => detail.message));
            }

            req.input = value;
            next();
        });
    }

    configApp() {
        logger.info(`Configuring ${this.modelName} routes`);
        this.addGet();
        this.addGetOne();
        this.addPost();
        this.addPut();
        this.addDelete();
        //this.addJsonMethods();
    }
}

module.exports = CRUDController;
