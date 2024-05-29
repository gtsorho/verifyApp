"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const individual_1 = __importDefault(require("../controllers/individual"));
const router = express_1.default.Router();
router.post('/', individual_1.default.createIndividual);
router.get('/', individual_1.default.getIndividualsWithCertificates);
router.get('/verify', individual_1.default.checkCertificateExists);
router.get('/:id', individual_1.default.getIndividualByIdWithCertificates);
router.put('/:id', individual_1.default.updateIndividual);
router.delete('/:id', individual_1.default.deleteIndividual);
router.post('/certify', individual_1.default.populateCertificationPivot);
exports.default = router;
