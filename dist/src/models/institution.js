"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const createInstitutionModel = (sequelize) => {
    const Institution = sequelize.define('Institution', {
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        location: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        accreditation: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        }
    });
    return Institution;
};
exports.default = createInstitutionModel;
