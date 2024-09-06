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
const xlsx_1 = __importDefault(require("xlsx"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
        var _a;
        const { IndividualId, organization, CertificateId, issueDate, expiryDate } = req.body;
        if (((_a = req.decodedToken) === null || _a === void 0 ? void 0 : _a.role) === "organization") {
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
                                { prefix: certificate },
                                { id: certificate }
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
    }),
    fileUploadCertificate: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.file) {
            const filePath = req.file.path;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx_1.default.utils.sheet_to_json(sheet);
            try {
                const promises = data.map((row) => __awaiter(void 0, void 0, void 0, function* () {
                    const individual = yield checkAndCreateIndividual(row['ghana_card/TIN'], row.organization);
                    const expiryDate = row.expiryDate;
                    const issueDate = row.issueDate;
                    return yield handleCertificate(row.certificate, individual.id, expiryDate, issueDate);
                }));
                const results = yield Promise.all(promises);
                res.json(results);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                res.status(500).json({ error: errorMessage });
            }
        }
        else {
            res.status(400).send('No file uploaded');
        }
    }),
    fileUploadIndividual: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.file) {
            const filePath = req.file.path;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx_1.default.utils.sheet_to_json(sheet);
            try {
                const promises = data.map((row) => __awaiter(void 0, void 0, void 0, function* () {
                    yield checkAndCreateIndividual(row['ghana_card/TIN'], row.organization);
                }));
                const results = yield Promise.all(promises);
                res.json(results);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                res.status(500).json({ error: errorMessage });
            }
        }
        else {
            res.status(400).send('No file uploaded');
        }
    }),
    downloadFile: (req, res) => {
        const uploadDir = path_1.default.join(__dirname, '../files');
        const filePath = path_1.default.join(uploadDir, 'certificationTemp.xlsx');
        fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send('File not found');
            }
            res.download(filePath, 'certificationTemp.xlsx', (err) => {
                if (err) {
                    res.status(500).send('Error downloading the file');
                }
            });
        });
    },
    downloadIndividualFile: (req, res) => {
        const uploadDir = path_1.default.join(__dirname, '../files');
        const filePath = path_1.default.join(uploadDir, 'individualsTemp.xlsx');
        fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send('File not found');
            }
            res.download(filePath, 'individualsTemp.xlsx', (err) => {
                if (err) {
                    res.status(500).send('Error downloading the file');
                }
            });
        });
    }
};
const checkAndCreateIndividual = (ghana_card, organization) => __awaiter(void 0, void 0, void 0, function* () {
    const individual = yield models_1.default.individual.findOne({ where: { ghana_card } });
    if (!individual) {
        return yield models_1.default.individual.create({ 'ghana_card': ghana_card, 'organization': organization });
    }
    return individual;
});
const handleCertificate = (certificateName, individualId, expiryDate, issueDate) => __awaiter(void 0, void 0, void 0, function* () {
    const certificate = yield models_1.default.certificate.findOne({ where: { prefix: certificateName } });
    if (!certificate) {
        throw new Error(`Certificate ${certificateName} not found`);
    }
    const existingEntry = yield models_1.default.certification_pivot.findOne({
        where: {
            IndividualId: individualId,
            CertificateId: certificate.id,
        }
    });
    if (existingEntry) {
        throw new Error(`Duplicate entry found for IndividualId ${individualId} and CertificateId ${certificate.id}`);
    }
    const certificationPivot = yield models_1.default.certification_pivot.create({
        IndividualId: individualId,
        CertificateId: certificate.id,
        issueDate,
        expiryDate
    });
    return certificationPivot;
});
