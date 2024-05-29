"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificate_1 = __importDefault(require("../controllers/certificate"));
const router = express_1.default.Router();
router.post('/', certificate_1.default.createCertificate);
router.get('/', certificate_1.default.getCertificates);
router.get('/:id', certificate_1.default.getCertificateById);
router.put('/:id', certificate_1.default.updateCertificate);
router.delete('/:id', certificate_1.default.deleteCertificate);
exports.default = router;
