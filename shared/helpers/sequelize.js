const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: (msg) => logger.info(msg),
        dialectOptions: {
          ssl: {
            require: process.env.DB_SSL,
            rejectUnauthorized: false
          }
        }
    },
  );
  

module.exports = { sequelize, Sequelize };