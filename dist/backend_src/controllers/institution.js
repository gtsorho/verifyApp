"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../models/index"));
const joi_1 = __importDefault(require("joi"));
const { QueryTypes } = require('sequelize');
const institutionSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    location: joi_1.default.string().required(),
    accreditation: joi_1.default.string().required(),
});
exports.default = {
    createInstitution: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { error } = institutionSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const institution = yield index_1.default.institution.create(req.body);
            res.status(201).json(institution);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    getInstitutions: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const institutions = yield index_1.default.institution.findAll({
                include: [{
                        model: index_1.default.certificate,
                    }]
            });
            const certificateCount = yield index_1.default.certificate.count({});
            const certificateIssuedCount = yield index_1.default.certification_pivot.count();
            const individualsAssociatedCount = yield index_1.default.individual.count();
            res.json([institutions, { 'individuals': individualsAssociatedCount, 'issued': certificateIssuedCount, 'certificates': certificateCount }]);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    getData: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const certificateCount = yield index_1.default.certificate.count({});
            const institutions = yield index_1.default.institution.count();
            const individualsAssociatedCount = yield index_1.default.individual.count();
            res.json({ 'individuals': individualsAssociatedCount, 'institutions': institutions, 'certificates': certificateCount });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    getInstitutionById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const institution = yield index_1.default.institution.findByPk(id, {
                include: [{
                        model: index_1.default.certificate,
                    }]
            });
            const certificateCount = yield index_1.default.certificate.count({
                where: {
                    institutionId: id
                }
            });
            const certificateIssuedCount = yield index_1.default.sequelize.query(`
              SELECT COUNT(*) as count
              FROM Certification_Pivots AS cp
              JOIN Certificates AS c ON cp.CertificateId = c.id
              WHERE c.InstitutionId = :institutionId
            `, {
                replacements: { institutionId: id },
                type: QueryTypes.SELECT
            });
            const individualsAssociatedCount = yield index_1.default.individual.count({
                include: [{
                        model: index_1.default.certificate,
                        where: {
                            institutionId: id
                        },
                        through: {
                            attributes: []
                        }
                    }],
                distinct: true
            });
            if (!institution) {
                return res.status(404).json({ message: 'Institution not found' });
            }
            res.json([[institution], { 'individuals': individualsAssociatedCount, 'issued': certificateIssuedCount[0].count, 'certificates': certificateCount }]);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    updateInstitution: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const [updated] = yield index_1.default.institution.update(req.body, { where: { id } });
            if (!updated) {
                return res.status(404).json({ message: 'Institution not found' });
            }
            const updatedInstitution = yield index_1.default.institution.findByPk(id);
            res.json(updatedInstitution);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    deleteInstitution: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const deleted = yield index_1.default.institution.destroy({ where: { id } });
            if (!deleted) {
                return res.status(404).json({ message: 'Institution not found' });
            }
            res.json({ message: 'Institution deleted successfully' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
};
