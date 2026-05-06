import {Router} from 'express';
import {UserController} from '../controllers/UserController';
import {authMiddleware} from '../middlewares/authMiddleware';
import {perfilMiddleware} from '../middlewares/perfilMiddleware';
import {validate} from '../middlewares/validateMiddleware';
import {createUserSchema} from '../validators/user.schema';

const router = Router();
const ctrl = new UserController();

router.post('/', validate(createUserSchema), ctrl.register);
router.get('/', authMiddleware, perfilMiddleware('ADMIN'), ctrl.list);

export default router;
