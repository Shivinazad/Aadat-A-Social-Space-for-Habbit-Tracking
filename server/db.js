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
  : new Sequelize('aadat_db', 'root', 'sambhav.007', {
      host: 'localhost',
      dialect: 'mysql',
      logging: false
    });

module.exports = sequelize;