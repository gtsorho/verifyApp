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
const sequelize_1 = require("sequelize");
const individualSchema = joi_1.default.object({
    organization: joi_1.default.string().allow(null),
    ghana_card: joi_1.default.string().required()
});
const certificateIssuanceSchema = joi_1.default.object({
    IndividualId: joi_1.default.number().required(),
    CertificateId: joi_1.default.number().required(),
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
        var _a, _b;
        try {
            if (((_a = req.decodedToken) === null || _a === void 0 ? void 0 : _a.role) === 'admin') {
                const individuals = yield models_1.default.individual.findAll({
                    include: [
                        {
                            model: models_1.default.certificate,
                            include: [
                                {
                                    model: models_1.default.institution
                                }
                            ],
                            through: {
                                model: models_1.default.certification_pivot,
                            }
                        },
                    ]
                });
                res.json(individuals);
            }
            else {
                console.log(req.decodedToken);
                const institutionId = (_b = req.decodedToken) === null || _b === void 0 ? void 0 : _b.InstitutionID;
                const certificates = yield models_1.default.certificate.findAll({
                    where: {
                        InstitutionId: institutionId
                    }
                });
                const individuals = yield models_1.default.individual.findAll({
                    include: [{
                            model: models_1.default.certificate,
                            include: [
                                {
                                    model: models_1.default.institution
                                }
                            ],
                            where: {
                                id: certificates.map((cert) => cert.id)
                            }
                        }]
                });
                res.json(individuals);
            }
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
                            model: models_1.default.certification_pivot,
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
        var _c;
        const { IndividualId, organization, CertificateId, issueDate, expiryDate } = req.body;
        if (((_c = req.decodedToken) === null || _c === void 0 ? void 0 : _c.role) === "organization") {
            const certificate = yield models_1.default.certificate.findByPk(CertificateId);
            if (!certificate || certificate.InstitutionId !== req.decodedToken.InstitutionID) {
                return res.status(403).json({ message: 'Access denied. Certificate does not belong to your institution' });
            }
        }
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
            // else{
            //     const individual = await db.individual.create({});
            // }
            const certificate = yield models_1.default.certificate.findByPk(CertificateId);
            if (!certificate) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
            const certificationPivot = yield models_1.default.certification_pivot.create({
                IndividualId,
                CertificateId,
                issueDate,
                expiryDate
            });
            const count = yield models_1.default.certification_pivot.count({
                CertificateId
            });
            yield models_1.default.certificate.update({ count: count }, { where: { id: CertificateId } });
            res.status(201).json(certificationPivot);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    checkCertificateExists: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { ghana_cardNo, certificate } = req.query;
        try {
            const certificationPivot = yield models_1.default.certification_pivot.findOne({
                include: [
                    {
                        model: models_1.default.individual,
                        where: { ghana_card: ghana_cardNo }
                    },
                    {
                        model: models_1.default.certificate,
                        where: {
                            [sequelize_1.Op.or]: [
                                { certificate: certificate },
                                { prefix: certificate }
                            ]
                        }, include: [
                            {
                                model: models_1.default.institution,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });
            if (certificationPivot) {
                res.json({ exists: true, data: certificationPivot });
            }
            else {
                res.json({ exists: false });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    findRelatedCertificates: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { ghana_cardNo } = req.query;
        try {
            const individual = yield models_1.default.certification_pivot.findAll({
                include: [
                    {
                        model: models_1.default.individual,
                        where: { ghana_card: ghana_cardNo }
                    },
                    {
                        model: models_1.default.certificate,
                        include: [
                            {
                                model: models_1.default.institution,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });
            res.json(individual);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    })
};
