"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const individual_1 = __importDefault(require("../controllers/individual"));
const auth_1 = __importDefault(require("../middleware/auth"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const uploadDir = path_1.default.join(__dirname, '../uploads');
const files = fs_1.default.readdirSync(uploadDir);
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
for (const file of files) {
    fs_1.default.unlinkSync(path_1.default.join(uploadDir, file));
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
router.post('/upload_cert', (0, auth_1.default)(['admin', 'organization']), upload.single('excelFile'), individual_1.default.fileUploadCertificate);
router.post('/upload_Ind', (0, auth_1.default)(['admin', 'organization']), upload.single('excelFile'), individual_1.default.fileUploadIndividual);
router.get('/download_cert', (0, auth_1.default)(['admin', 'organization']), individual_1.default.downloadFile);
router.get('/download_Ind', (0, auth_1.default)(['admin', 'organization']), individual_1.default.downloadIndividualFile);
router.get('/verify', individual_1.default.checkCertificateExists);
router.get('/related', individual_1.default.findRelatedCertificates);
router.post('/', (0, auth_1.default)(['admin', 'organization']), individual_1.default.createIndividual);
router.get('/', (0, auth_1.default)(['admin', 'organization']), individual_1.default.getIndividualsWithCertificates);
router.post('/certify', individual_1.default.populateCertificationPivot);
router.get('/:id', (0, auth_1.default)(['admin', 'organization']), individual_1.default.getIndividualByIdWithCertificates);
router.put('/:id', (0, auth_1.default)(['admin', 'organization']), individual_1.default.updateIndividual);
router.delete('/:id', (0, auth_1.default)(['admin', 'organization']), individual_1.default.deleteIndividual);
exports.default = router;
