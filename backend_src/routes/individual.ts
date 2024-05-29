import express from 'express';
import individualController from '../controllers/individual';
import authenticateJWT  from "../middleware/auth";

const router = express.Router();

router.get('/verify', individualController.checkCertificateExists);
router.get('/related', individualController.findRelatedCertificates);
router.post('/', authenticateJWT(['admin', 'organization']), individualController.createIndividual);
router.get('/', authenticateJWT(['admin', 'organization']), individualController.getIndividualsWithCertificates);
router.get('/:id', authenticateJWT(['admin', 'organization']), individualController.getIndividualByIdWithCertificates);
router.put('/:id', authenticateJWT(['admin', 'organization']), individualController.updateIndividual);
router.delete('/:id', authenticateJWT(['admin', 'organization']), individualController.deleteIndividual);
router.post('/certify',  individualController.populateCertificationPivot);

export default router;
