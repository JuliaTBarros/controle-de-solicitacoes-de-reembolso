import {Router} from 'express';
import {AuthController} from '../controllers/AuthController';
import {validate} from '../middlewares/validateMiddleware';
import {loginSchema} from '../validators/auth.schema';

const router = Router();
const ctrl = new AuthController();

router.post('/login', validate(loginSchema), ctrl.login);

export default router;
