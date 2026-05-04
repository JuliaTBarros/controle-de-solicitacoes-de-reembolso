import {Router} from 'express';
import {CategoriaController} from '../controllers/CategoriaController';
import {authMiddleware} from '../middlewares/authMiddleware';
import {perfilMiddleware} from '../middlewares/perfilMiddleware';
import {validate} from '../middlewares/validateMiddleware';
import {createCategoriaSchema, updateCategoriaSchema} from '../validators/categoria.schema';

const router = Router();
const ctrl = new CategoriaController();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', perfilMiddleware('ADMIN'), validate(createCategoriaSchema), ctrl.create);
router.put('/:id', perfilMiddleware('ADMIN'), validate(updateCategoriaSchema), ctrl.update);

export default router;
