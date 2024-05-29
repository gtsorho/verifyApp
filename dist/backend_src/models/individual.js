"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const createIndividualModel = (sequelize) => {
    const Individual = sequelize.define('Individual', {
        organization: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            defaultValue: 'individual'
        },
        ghana_card: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
    });
    return Individual;
};
exports.default = createIndividualModel;
