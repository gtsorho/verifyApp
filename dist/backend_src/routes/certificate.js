"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificate_1 = __importDefault(require("../controllers/certificate"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(['admin', 'organization']), certificate_1.default.createCertificate);
router.get('/', (0, auth_1.default)(['admin', 'organization']), certificate_1.default.getCertificates);
router.get('/search', certificate_1.default.searchCertificates);
router.get('/:id', (0, auth_1.default)(['admin', 'organization']), certificate_1.default.getCertificateById);
router.put('/:id', (0, auth_1.default)(['admin', 'organization']), certificate_1.default.updateCertificate);
router.delete('/:id', (0, auth_1.default)(['admin', 'organization']), certificate_1.default.deleteCertificate);
exports.default = router;
