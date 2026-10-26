import { Router } from 'express';
import { signup, signin, signout, me } from '../controllers/auth.controller.js';
import { validateRequest } from '../../../middlewares/validators.middleware.js';
import { verifyAuth } from '../../../middlewares/verifyAuth.middleware.js';
import { validateSignup, validateSignin } from '../validators/auth.validators.js';
const router = Router();
// Public endpoints
router.post('/signup', validateRequest(validateSignup), signup);
router.post('/signin', validateRequest(validateSignin), signin);
router.post('/signout', signout);
// Protected endpoint
router.get('/me', verifyAuth, me);
export default router;
