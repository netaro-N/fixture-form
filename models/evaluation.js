'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Evaluation = loader.database.define('evaluations', {
  postId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  evaluation: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  freezeTableName: true,
  timestamps: false
});

module.exports = Evaluation;