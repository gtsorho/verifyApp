"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const createIndividualModel = (sequelize) => {
    const Individual = sequelize.define('Individual', {
        firstName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        organization: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        ghana_card: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        dob: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        gender: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        nationality: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        }
    });
    return Individual;
};
exports.default = createIndividualModel;
