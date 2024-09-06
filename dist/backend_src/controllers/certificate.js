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
const certificateSchema = joi_1.default.object({
    certificate: joi_1.default.string().required(),
    prefix: joi_1.default.string().required(),
    count: joi_1.default.number(),
    category: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    InstitutionId: joi_1.default.string().allow(null)
});
exports.default = {
    createCertificate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (((_a = req.decodedToken) === null || _a === void 0 ? void 0 : _a.role) == "organization")
                req.body.InstitutionId = req.decodedToken.InstitutionID;
            const { error } = certificateSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const certificate = yield models_1.default.certificate.create(req.body);
            res.status(201).json(certificate);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    getCertificates: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (((_a = req.decodedToken) === null || _a === void 0 ? void 0 : _a.role) === "organization") {
                const query = {
                    where: {
                        InstitutionId: req.decodedToken.InstitutionID
                    }
                };
                const certificates = yield models_1.default.certificate.findAll(Object.assign({ include: [{
                            model: models_1.default.institution,
                        }] }, query));
                res.json(certificates);
            }
            else {
                const certificates = yield models_1.default.certificate.findAll({
                    include: [{
                            model: models_1.default.institution,
                        }]
                });
                res.json(certificates);
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    getCertificateById: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        try {
            const certificate = yield models_1.default.certificate.findByPk(id, {
                include: [{
                        model: models_1.default.institution,
                    }]
            });
            if (!certificate) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
            if (((_a = req.decodedToken) === null || _a === void 0 ? void 0 : _a.role) === "organization") {
                const query = {
                    where: {
                        InstitutionId: req.decodedToken.InstitutionID
                    }
                };
                certificate.institution = yield models_1.default.institution.findOne({
                    where: {
                        id: req.decodedToken.InstitutionID
                    }
                });
                certificate.certificates = yield models_1.default.certificate.findAll(Object.assign(Object.assign({}, query), { include: [{
                            model: models_1.default.institution,
                        }] }));
            }
            res.json(certificate);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    updateCertificate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const { error } = certificateSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const [updated] = yield models_1.default.certificate.update(req.body, { where: { id } });
            if (!updated) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
            const updatedCertificate = yield models_1.default.certificate.findByPk(id);
            res.json(updatedCertificate);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    deleteCertificate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const deleted = yield models_1.default.certificate.destroy({ where: { id } });
            if (!deleted) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
            res.json({ message: 'Certificate deleted successfully' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
    searchCertificates: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const searchValue = req.query.search;
            let queryOptions = {
                include: [{
                        model: models_1.default.institution,
                    }],
                where: {}
            };
            if (searchValue) {
                queryOptions.where = Object.assign(Object.assign({}, queryOptions.where), { [sequelize_1.Op.or]: [
                        { certificate: { [sequelize_1.Op.like]: `%${searchValue}%` } },
                        { category: { [sequelize_1.Op.like]: `%${searchValue}%` } },
                        { description: { [sequelize_1.Op.like]: `%${searchValue}%` } },
                        { prefix: { [sequelize_1.Op.like]: `%${searchValue}%` } },
                    ] });
            }
            const certificates = yield models_1.default.certificate.findAll(queryOptions);
            res.json(certificates);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }),
};
