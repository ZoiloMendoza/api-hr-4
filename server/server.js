const init = require('../shared/init');

const util = require('util')

const path = require("path");
const fs = require("fs");
const { Umzug, SequelizeStorage } = require('umzug');
const config = require("./config/vault-config");


async function runMigrations() {
  // Set up Umzug to run migrations programmatically
  const { sequelize } = helpers;
  const migrationFolders = [
    path.join(__dirname, '../', 'server', 'migrations'),
    ...fs.readdirSync(path.join(__dirname, '../', 'modules'))
      .filter((moduleName) => fs.lstatSync(path.join(__dirname, '../', 'modules', moduleName)).isDirectory())
      .map((moduleName) => path.join(__dirname,'../', 'modules', moduleName, 'migrations')),
  ];

  let migrationFiles = [];
  for (const folder of migrationFolders) {
    if (fs.existsSync(folder)) {
      const files = fs.readdirSync(folder)
        .filter((file) => file.endsWith('.js')) // Only include .js files
        .map((file) => ({
          path: path.join(folder, file),
          name: file,
        }));
      migrationFiles = migrationFiles.concat(files);
    } else {
      console.warn(`Migration folder does not exist: ${folder}`);
    }
  }

  // Sort migration files by name (ensures order across all folders)
  migrationFiles.sort((a, b) => a.name.localeCompare(b.name));
  const umzug = new Umzug({
    migrations: migrationFiles.map((file) => ({
      name: file.name,
      up: async () => {
        const migration = require(file.path);
        return migration.up(sequelize.sequelize.getQueryInterface(), sequelize.Sequelize);
      },
      down: async () => {
        const migration = require(file.path);
        return migration.down(sequelize.getQueryInterface(), sequelize.Sequelize);
      },
    })),
    context: sequelize.sequelize,
    storage: new SequelizeStorage({ sequelize: sequelize.sequelize }),
  });

  try {
      // Run all pending migrations
      await umzug.up();
      logger.info('All migrations have been run successfully');
  } catch (error) {
      logger.error('Error occurred while running migrations:' +  error);
  }
}

function loadRoutes(app, folder) {
   logger.info(`Loading routes from ${folder}`);
   if (!fs.existsSync(folder)) {
      return;
   }
   fs.readdirSync(folder).forEach(file => {
     if (fs.lstatSync(path.join(folder, file)).isDirectory()) {
        loadRoutes(app, path.join(folder, file));
     } else {
      if (file.endsWith('.js')) {
        logger.info(`Loading file ${file}`);
        const route = require(path.join(folder, file));
        if (route instanceof helpers.BaseController) {
          app.use(route.getApp());
        } else {
          app.use(route);
        }
      }
    }
   });
}

(async () => {
  try {
    await config.config();
    await init();
    logger.level = process.env.LOG_LEVEL || "info";
        
    await runMigrations();
    
    const express = require("express");
    const cors = require("cors");
    const bodyParser = require("body-parser");
    const { tokenVerify } = require("./../shared/middleware/security-middleware");
    const storeUserMiddleware = require('../shared/middleware/context-middleware');
    const app = express();
    const server = require('http').createServer(app);
    const io = require('socket.io')(server, {
        path: '/socket',
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    const { socketController } = require('./socket/controller');
    io.on('connection', socketController);
  
    app.use(cors());
    app.use(i18n.init);
  
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(tokenVerify);
    app.use(storeUserMiddleware); 

    for (const [moduleName, mod] of modules) {
       logger.info(`Loading controllers for module ${moduleName}`);
       const moduleRoutes = path.join(mod.basePath , 'routes');
       if (fs.existsSync(moduleRoutes)) {
          mod.module.loadControllers(moduleRoutes);
          mod.module.controllers.forEach((controller) => {
            app.use(controller);
          });
       }
    };
    loadRoutes(app, path.join(__dirname, 'routes'));
    server.listen(process.env.PORT, async () => {
    logger.info(i18n.__("Listening to Port", process.env.PORT));
    });
  } catch (error) {
    logger.error(`Error starting server: ${error}`);
    process.exit(1);
  }
})();
