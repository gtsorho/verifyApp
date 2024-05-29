"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const individual_1 = __importDefault(require("../controllers/individual"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.get('/verify', individual_1.default.checkCertificateExists);
router.get('/related', individual_1.default.findRelatedCertificates);
router.post('/', (0, auth_1.default)(['admin', 'organization']), individual_1.default.createIndividual);
router.get('/', (0, auth_1.default)(['admin', 'organization']), individual_1.default.getIndividualsWithCertificates);
router.get('/:id', (0, auth_1.default)(['admin', 'organization']), individual_1.default.getIndividualByIdWithCertificates);
router.put('/:id', (0, auth_1.default)(['admin', 'organization']), individual_1.default.updateIndividual);
router.delete('/:id', (0, auth_1.default)(['admin', 'organization']), individual_1.default.deleteIndividual);
router.post('/certify', individual_1.default.populateCertificationPivot);
exports.default = router;
