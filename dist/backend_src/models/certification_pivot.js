"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// Define the Certification_Pivot model
const createCertificationModel = (sequelize) => {
    const Certification_Pivot = sequelize.define('Certification_Pivot', {
        issueDate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        expiryDate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        IndividualId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            unique: 'uniqueIndividualCertificate'
        },
        CertificateId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            unique: 'uniqueIndividualCertificate'
        }
    });
    return Certification_Pivot;
};
exports.default = createCertificationModel;
