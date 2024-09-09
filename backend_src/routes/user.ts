import express from 'express';
import userController from '../controllers/user';
import authenticateJWT  from "../middleware/auth";

const router = express.Router();

router.post('/', userController.createUser);
router.post('/login', userController.login);
router.get('/', authenticateJWT('admin'), userController.getUsers);
router.get('/:id', authenticateJWT(['admin', 'organization']), userController.getUser);
router.delete('/:id', authenticateJWT('admin'), userController.destroyUser);
router.put('/update/:id', authenticateJWT('admin'), userController.updateUser);


export default router;
 