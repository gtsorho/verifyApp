"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const createCertificationModel = (sequelize) => {
    const Certification_Pivot = sequelize.define('Certification_Pivot', {
        issueDate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        expiryDate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        certificationNo: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
    });
    return Certification_Pivot;
};
exports.default = createCertificationModel;
