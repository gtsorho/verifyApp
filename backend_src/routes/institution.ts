import express from 'express';
import institutionController from '../controllers/institution';
import authenticateJWT  from "../middleware/auth";

const router = express.Router();

router.post('/', authenticateJWT(['admin']),institutionController.createInstitution);
router.get('/',  authenticateJWT(['admin', 'organization']),institutionController.getInstitutions);
router.get('/home',  institutionController.getData);
router.get('/:id', authenticateJWT(['admin', 'organization']), institutionController.getInstitutionById);
router.put('/:id',  authenticateJWT(['admin']),institutionController.updateInstitution);
router.delete('/:id',  authenticateJWT(['admin']),institutionController.deleteInstitution);


export default router;
