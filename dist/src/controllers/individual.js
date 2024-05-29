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
const models_1 = __importDefault(require("../models"));
const joi_1 = __importDefault(require("joi"));
const individualSchema = joi_1.default.object({
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    organization: joi_1.default.string().allow(null),
    ghana_card: joi_1.default.string().required(),
    dob: joi_1.default.string().allow(null),
    gender: joi_1.default.string().required(),
    nationality: joi_1.default.string().required(),
});
const certificateIssuanceSchema = joi_1.default.object({
    IndividualId: joi_1.default.number().required(),
    CertificateId: joi_1.default.number().required(),
    certificationNo: joi_1.default.string().required(),
    issueDate: joi_1.default.date().iso().allow(null),
    expiryDate: joi_1.default.date().iso().allow(null),
});
exports.default = {
    createIndividual: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { error } = individualSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const individual = yield models_1.default.individual.create(req.body);
            res.status(201).json(individual);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    getIndividualsWithCertificates: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const individuals = yield models_1.default.individual.findAll({
                include: [
                    {
                        model: models_1.default.certificate,
                        through: {
                            model: models_1.default.certification_pivot,
                        }
                    }
                ]
            });
            res.json(individuals);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    getIndividualByIdWithCertificates: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const individual = yield models_1.default.individual.findByPk(id, {
                include: [
                    {
                        model: models_1.default.certificate,
                        through: {
                            model: models_1.default.certification_pivot, // Pivot model
                        }
                    }
                ]
            });
            if (!individual) {
                return res.status(404).json({ message: 'Individual not found' });
            }
            res.json(individual);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    updateIndividual: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const { error } = individualSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const [updated] = yield models_1.default.individual.update(req.body, { where: { id } });
            if (!updated) {
                return res.status(404).json({ message: 'Individual not found' });
            }
            const updatedIndividual = yield models_1.default.individual.findByPk(id);
            res.json(updatedIndividual);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    deleteIndividual: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const deleted = yield models_1.default.individual.destroy({ where: { id } });
            if (!deleted) {
                return res.status(404).json({ message: 'Individual not found' });
            }
            res.json({ message: 'Individual deleted successfully' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    populateCertificationPivot: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { IndividualId, CertificateId, certificationNo, issueDate, expiryDate } = req.body;
        try {
            const { error } = certificateIssuanceSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            if (!IndividualId || !CertificateId) {
                return res.status(400).json({ message: 'IndividualId and CertificateId are required in the query' });
            }
            const individual = yield models_1.default.individual.findByPk(IndividualId);
            if (!individual) {
                return res.status(404).json({ message: 'Individual not found' });
            }
            const certificate = yield models_1.default.certificate.findByPk(CertificateId);
            if (!certificate) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
            const certificationPivot = yield models_1.default.certification_pivot.create({
                IndividualId,
                CertificateId,
                certificationNo,
                issueDate,
                expiryDate
            });
            res.status(201).json(certificationPivot);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    checkCertificateExists: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { ghana_cardNo, certificateNo } = req.query;
        try {
            const individual = yield models_1.default.individual.findOne({
                where: {
                    ghana_card: ghana_cardNo
                },
                include: [{
                        model: models_1.default.certificate,
                        where: {
                            certificateNo: certificateNo
                        },
                        through: { attributes: [] }
                    }]
            });
            if (individual) {
                res.json({ exists: true });
            }
            else {
                res.json({ exists: false });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    })
};
