"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const createCertificationModel = (sequelize) => {
    const Certificate = sequelize.define('Certificate', {
        certificate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        prefix: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        count: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true
        },
        category: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true
    });
    return Certificate;
};
exports.default = createCertificationModel;
