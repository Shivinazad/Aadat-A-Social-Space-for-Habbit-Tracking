// server/db.js

const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  })
  : new Sequelize(
    process.env.DB_NAME || 'aadat_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'sambhav.007',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false
    }
  );

module.exports = sequelize;