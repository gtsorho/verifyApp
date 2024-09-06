import express from 'express';
import certificateController from '../controllers/certificate';
import authenticateJWT  from "../middleware/auth";

const router = express.Router();

router.post('/', authenticateJWT(['admin', 'organization']),  certificateController.createCertificate);
router.get('/', authenticateJWT(['admin', 'organization']),  certificateController.getCertificates);
router.get('/search',  certificateController.searchCertificates);
router.get('/:id', authenticateJWT(['admin', 'organization']),  certificateController.getCertificateById);
router.put('/:id', authenticateJWT(['admin', 'organization']),  certificateController.updateCertificate);
router.delete('/:id', authenticateJWT(['admin', 'organization']),  certificateController.deleteCertificate);

export default router;
