import {Router} from 'express';
import {AuthController} from '../controllers/AuthController';
import {validate} from '../middlewares/validateMiddleware';
import {loginSchema, registerSchema} from '../validators/auth.schema';

const router = Router();
const ctrl = new AuthController();

router.post('/login', validate(loginSchema), ctrl.login);
router.post('/register', validate(registerSchema), ctrl.register);

export default router;
