import express from 'express';
import { register, login, updatePreferences, getProfile } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.patch('/preferences', auth, updatePreferences);

export default router; 