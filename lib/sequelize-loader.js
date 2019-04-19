'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/fixture_form'
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};