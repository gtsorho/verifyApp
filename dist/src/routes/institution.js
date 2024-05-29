"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const institution_1 = __importDefault(require("../controllers/institution"));
const router = express_1.default.Router();
router.post('/', institution_1.default.createInstitution);
router.get('/', institution_1.default.getInstitutions);
router.get('/:id', institution_1.default.getInstitutionById);
router.put('/:id', institution_1.default.updateInstitution);
router.delete('/:id', institution_1.default.deleteInstitution);
exports.default = router;
