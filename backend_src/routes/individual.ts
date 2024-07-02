import express from 'express';
import individualController from '../controllers/individual';
import authenticateJWT  from "../middleware/auth";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');

const files = fs.readdirSync(uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

for (const file of files) {
    fs.unlinkSync(path.join(uploadDir, file));
  }

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage });
  
  router.post('/upload', authenticateJWT(['admin', 'organization']),upload.single('excelFile'), individualController.fileUpload);
  router.get('/download', authenticateJWT(['admin', 'organization']),individualController.downloadFile);
  
  router.get('/verify', individualController.checkCertificateExists);
  router.get('/related', individualController.findRelatedCertificates);
  router.post('/', authenticateJWT(['admin', 'organization']), individualController.createIndividual);
  router.get('/', authenticateJWT(['admin', 'organization']), individualController.getIndividualsWithCertificates);
  router.post('/certify', individualController.populateCertificationPivot);
  
  router.get('/:id', authenticateJWT(['admin', 'organization']), individualController.getIndividualByIdWithCertificates);
  router.put('/:id', authenticateJWT(['admin', 'organization']), individualController.updateIndividual);
  router.delete('/:id', authenticateJWT(['admin', 'organization']), individualController.deleteIndividual);
  
export default router;
