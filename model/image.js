const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Image = sequelize.define('Image', {
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customHeader: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Image;
