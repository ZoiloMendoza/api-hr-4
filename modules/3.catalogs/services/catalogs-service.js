const { catalog } = models;
const NodeCache = require('node-cache');
const { BaseService, entityErrors } = helpers;

class CatalogService extends BaseService {
    constructor() {
        super();
        this.cache = new NodeCache();
    }

    getModelName() {
        return 'catalog';
    }

    checkValidCatalogType(type) {
        return type;
    }

    async loadCatalogs(companyID) {
        logger.info('Cache miss, fetching from database');
        const cacheKey = `all-catalogs-${companyID}`;
        const catalogs = await catalog.findAll({
            where: { active: true, companyId: companyID },
        });

        const processedCatalogs = {};
        catalogs.forEach((cat) => {
            if (!processedCatalogs[cat.type]) {
                processedCatalogs[cat.type] = [];
            }
            processedCatalogs[cat.type].push({
                id: cat.id,
                name: cat.name,
                description: cat.description,
            });
        });
        this.cache.set(cacheKey, processedCatalogs);
        return processedCatalogs;
    }

    //List all catalogs
    async getCatalogsAllType(filter) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        let catalogs = this.cache.get(cacheKey);
        if (!catalogs) {
            catalogs = await this.loadCatalogs(currentUser.company.id);
        }
        catalogs = Object.keys(catalogs).map((c) => {
            return { type: c };
        });
        // TODO: Revisar logica de filtros
        // if (filter.filter.type) {
        //     catalogs = catalogs.filter((c) =>
        //         c.type
        //             .toLowerCase()
        //             .includes(filter.filter.type.value.toLowerCase()),
        //     );
        // }
        return catalogs;
    }

    async getCatalog(type, id) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        let cat = this.cache.get(cacheKey);
        if (!cat) {
            cat = await this.loadCatalogs(currentUser.company.id);
        }
        if (cat) {
            if (cat[type]) {
                const element = cat[type].find((c) => c.id == id);
                if (element) {
                    return element;
                }
            }
        }
        throw new entityErrors.EntityNotFoundError(
            i18n.__('entity not found', 'valor'),
        );
    }

    // List all elements of a catalog
    async getCatalogElements(type, filter) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        let catalogs = this.cache.get(cacheKey);
        if (!catalogs) {
            catalogs = await this.loadCatalogs(currentUser.company.id);
        }
        let cat = catalogs[type];
        if (!cat) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('cataolog not found', type),
            );
        }
        let cols = ['id', 'name', 'description'];
        cols.forEach((col) => {
            if (filter.filter[col]) {
                cat = catalog.filter((c) =>
                    c[col]
                        .toString()
                        .toLowerCase()
                        .includes(
                            filter.filter[col].value.toString().toLowerCase(),
                        ),
                );
            }
        });
        return cat;
    }

    async addCatalog(type, data) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        type = this.checkValidCatalogType(type);
        const cat = await catalog.create({
            ...data,
            type,
            companyId: currentUser.company.id,
        });
        if (services.auditlogService) {
            await services.auditlogService.createLog({
                entityName: this.getModelName(),
                entityId: cat.id,
                action: 'create',
                oldData: null,
                newData: cat.dataValues,
                userId: currentUser.id,
                username: currentUser.username,
                companyId: currentUser.company.id,
            });
        }
        this.cache.del(cacheKey);
        await this.loadCatalogs(currentUser.company.id);
        return {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            type: cat.type,
        };
    }

    async updateCatalog(type, id, data) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        data.companyId = currentUser.company.id;

        type = this.checkValidCatalogType(type);
        const cat = await catalog.findOne({
            where: { id, type, active: true },
        });
        if (!cat) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'valor'),
            );
        }

        await cat.update(data);
        if (services.auditlogService) {
            await services.auditlogService.createLog({
                entityName: this.getModelName(),
                entityId: cat.id,
                action: 'update',
                oldData: cat._previousDataValues,
                newData: cat.dataValues,
                userId: currentUser.id,
                username: currentUser.username,
                companyId: currentUser.company.id,
            });
        }
        this.cache.del(cacheKey);
        await this.loadCatalogs(currentUser.company.id);
        return {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            type: cat.type,
        };
    }

    async deleteCatalog(type, id) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;

        type = this.checkValidCatalogType(type);
        const cat = await catalog.findOne({
            where: { id, type, active: true },
        });
        if (!cat) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'valor'),
            );
        }
        cat.active = false;
        await cat.save();
        if (services.auditlogService) {
            await services.auditlogService.createLog({
                entityName: this.getModelName(),
                entityId: cat.id,
                action: 'delete',
                oldData: cat._previousDataValues,
                newData: cat.dataValues,
                userId: currentUser.id,
                username: currentUser.username,
                companyId: currentUser.company.id,
            });
        }
        this.cache.del(cacheKey);
        await this.loadCatalogs(currentUser.company.id);
        return {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            type: cat.type,
        };
    }

    async test() {
        return 'test';
    }
}

module.exports = new CatalogService();
