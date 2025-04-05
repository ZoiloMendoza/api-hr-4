const { BaseController, SearchResult, CRUDParser, entityErrors } = helpers;
//const { catalogService } = services;
const catalogService = require('../services/catalogs-service');
const { catalog } = models;

class CatalogController extends BaseController {
    constructor() {
        super();
        this.neededROLE = false;
        this.setValidator(validators['catalog']);
        this.initializeRoutes();
        this.parser = new CRUDParser(catalog);
    }

    initializeRoutes() {
        //List all catalogs
        this.addRoute('get', '/catalogs', this.handleGetAllType.bind(this));
        //List all elements of a catalog
        this.addRoute('get', '/catalog/:type', this.handleGetAll.bind(this));

        //Get a catalog element
        this.addRoute('get', '/catalog/:type/:id', this.handleGet.bind(this));

        this.addRoute('post', '/catalog/:type', this.handlePost.bind(this));

        this.addRoute('put', '/catalog/:type/:id', this.handlePut.bind(this));
        this.addRoute(
            'delete',
            '/catalog/:type/:id',
            this.handleDelete.bind(this),
        );
    }

    //List all catalogs
    async handleGetAllType(req, res) {
        logger.info('CatalogController.handleGetAllType');
        // Not using offset and limit for caatalogs
        delete req.query.start;
        delete req.query.limit;
        const filter = this.parser.parse(req.query);
        try {
            const catalogs = await catalogService.getCatalogsAllType(filter);
            res.json(
                new SearchResult(catalogs, 1, catalogs.length, catalogs.length),
            );
        } catch (error) {
            if (error instanceof entityErrors.EntityNotFoundError) {
                return res.status(404).json({ errors: [error.message] });
            }

            res.status(500).json([res.__('generic error', error.toString())]);
        }
    }

    //List all elements of a catalog
    async handleGetAll(req, res) {
        try {
            const { type } = req.params;
            // Not using offset and limit for caatalogs
            delete req.query.start;
            delete req.query.limit;
            const filter = this.parser.parse(req.query);
            const cat = await catalogService.getCatalogElements(type, filter);
            res.json(new SearchResult(cat, 1, cat.length, cat.length));
        } catch (error) {
            if (error instanceof entityErrors.EntityNotFoundError) {
                return res.status(404).json({ errors: [error.message] });
            }

            res.status(500).json([res.__('generic error', error.toString())]);
        }
    }

    //Find a catalog element by id
    async handleGet(req, res) {
        try {
            const { type, id } = req.params;
            const cat = await catalogService.getCatalog(type, id);
            res.json(cat);
        } catch (error) {
            if (error instanceof entityErrors.EntityNotFoundError) {
                return res.status(404).json([error.message]);
            }
            res.status(500).json([res.__('generic error', error.toString())]);
        }
    }

    // Create a new catalog and/or catalog element
    // TODO: Missing validations (unique, required, etc)
    async handlePost(req, res) {
        try {
            const { type } = req.params;
            const cat = await catalogService.addCatalog(type, req.input);
            res.status(201).json(cat);
        } catch (error) {
            if (error instanceof entityErrors.EntityNotFoundError) {
                return res.status(404).json([error.message]);
            }
            res.status(500).json([res.__('generic error', error.toString())]);
        }
    }

    // Update a catalog element
    // TODO: Missing validations (unique, required, etc)
    async handlePut(req, res) {
        try {
            const { type, id } = req.params;
            const cat = await catalogService.updateCatalog(type, id, req.input);
            res.json(cat);
        } catch (error) {
            if (error instanceof entityErrors.EntityNotFoundError) {
                return res.status(404).json([error.message]);
            }
            res.status(500).json([res.__('generic error', error.toString())]);
        }
    }

    async handleDelete(req, res) {
        try {
            const { type, id } = req.params;
            const result = await catalogService.deleteCatalog(type, id);
            res.status(204).send();
        } catch (error) {
            if (error instanceof entityErrors.EntityNotFoundError) {
                return res.status(404).json([error.message]);
            }
            res.status(500).json([res.__('generic error', error.toString())]);
        }
    }
}

module.exports = new CatalogController();
