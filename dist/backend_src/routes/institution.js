"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const institution_1 = __importDefault(require("../controllers/institution"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(['admin']), institution_1.default.createInstitution);
router.get('/', (0, auth_1.default)(['admin', 'organization']), institution_1.default.getInstitutions);
router.get('/home', institution_1.default.getData);
router.get('/:id', (0, auth_1.default)(['admin', 'organization']), institution_1.default.getInstitutionById);
router.put('/:id', (0, auth_1.default)(['admin']), institution_1.default.updateInstitution);
router.delete('/:id', (0, auth_1.default)(['admin']), institution_1.default.deleteInstitution);
exports.default = router;
