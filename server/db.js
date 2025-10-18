// server/db.js

const { Sequelize } = require('sequelize');

// IMPORTANT: Replace 'your_password' with your MySQL root password.
const sequelize = new Sequelize('aadat_db', 'root', 'sambhav.007', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;