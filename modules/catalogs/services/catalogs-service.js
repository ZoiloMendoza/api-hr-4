const { Catalog } = models;
const NodeCache = require('node-cache');    
const { BaseService, entityErrors } = helpers;

class CatalogService extends BaseService {
    constructor() {
        super();
        this.cache = new NodeCache();
    }

    getModelName() {
        return 'Catalog';
    }

    checkValidCatalogType(type) {
        /*const catalogType = Object.values(catalogTypesObject).includes(type);
        if (!catalogType) {
            throw new EntityNotFoundError(
                i18n.__('entity not found', 'tipo de catálogo'),
            );
        }*/
        return type;
    }

    async loadCatalogs(companyID) {
        logger.info('Cache miss, fetching from database');
        const cacheKey = `all-catalogs-${companyID}`;
        const catalogs = await Catalog.findAll({
            where: { active: true, companyId: companyID },
        });

        const processedCatalogs = {};
        catalogs.forEach((catalog) => {
            if (!processedCatalogs[catalog.type]) {
                processedCatalogs[catalog.type] = [];
            }
            processedCatalogs[catalog.type].push({
                id: catalog.id,
                name: catalog.name,
                description: catalog.description,
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
        if (filter.filter.type) {
            catalogs = catalogs.filter((c) =>
                c.type
                    .toLowerCase()
                    .includes(filter.filter.type.value.toLowerCase()),
            );
        }
        return catalogs;
    }

    async getCatalog(type, id) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        let catalog = this.cache.get(cacheKey);
        if (!catalog) {
            catalog = await this.loadCatalogs(currentUser.company.id);
        }
        if (catalog) {
            if (catalog[type]) {
                const element = catalog[type].find((c) => c.id == id);
                if (element) {
                    return element;
                }
            }
        }
        throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'valor'));
    }

    // List all elements of a catalog
    async getCatalogElements(type, filter) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        let catalogs = this.cache.get(cacheKey);
        if (!catalogs) {
            catalogs = await this.loadCatalogs(currentUser.company.id);
        }
        let catalog = catalogs[type];
        if (!catalog) {
            throw new entityErrors.EntityNotFoundError(i18n.__('cataolog not found', type));
        }
        let cols = ['id', 'name', 'description'];
        cols.forEach((col) => {
            if (filter.filter[col]) {
                catalog = catalog.filter((c) =>
                    c[col]
                        .toString()
                        .toLowerCase()
                        .includes(
                            filter.filter[col].value.toString().toLowerCase(),
                        ),
                );
            }
        });
        return catalog;
    }

    async addCatalog(type, data) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        type = this.checkValidCatalogType(type);
        const catalog = await Catalog.create({ ...data, type, companyId: currentUser.company.id });
        this.cache.del(cacheKey);
        await this.loadCatalogs(currentUser.company.id);
        return {
            id: catalog.id,
            name: catalog.name,
            description: catalog.description,
            type: catalog.type,
        };
    }

    async updateCatalog(type, id, data) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        data.companyId = currentUser.company.id;
        
        type = this.checkValidCatalogType(type);
        const catalog = await Catalog.findOne({
            where: { id, type, active: true },
        });
        if (!catalog) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'valor'));
        }

        await catalog.update(data);
        this.cache.del(cacheKey);
        await this.loadCatalogs(currentUser.company.id);
        return {
            id: catalog.id,
            name: catalog.name,
            description: catalog.description,
            type: catalog.type,
        };
    }

    async deleteCatalog(type, id) {
        const currentUser = this.getLoggedUser();
        const cacheKey = `all-catalogs-${currentUser.company.id}`;
        
        type = this.checkValidCatalogType(type);
        const catalog = await Catalog.findOne({
            where: { id, type, active: true },
        });
        if (!catalog) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'valor'));
        }
        catalog.active = false;
        await catalog.save();
        this.cache.del(cacheKey);
        await this.loadCatalogs(currentUser.company.id);
        return {
            id: catalog.id,
            name: catalog.name,
            description: catalog.description,
            type: catalog.type,
        };
    }
}

module.exports = new CatalogService();
