import {Router} from 'express';
import {UserController} from '../controllers/UserController';
import {authMiddleware} from '../middlewares/authMiddleware';
import {perfilMiddleware} from '../middlewares/perfilMiddleware';

const router = Router();
const ctrl = new UserController();

router.use(authMiddleware);

router.get('/', perfilMiddleware('ADMIN'), ctrl.list);

export default router;
