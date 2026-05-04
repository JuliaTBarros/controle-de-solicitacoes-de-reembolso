import {Router} from 'express';
import {ReembolsoController} from '../controllers/ReembolsoController';
import {AnexoController} from '../controllers/AnexoController';
import {authMiddleware} from '../middlewares/authMiddleware';
import {perfilMiddleware} from '../middlewares/perfilMiddleware';
import {validate} from '../middlewares/validateMiddleware';
import {
    createReimbursementSchema,
    updateReimbursementSchema,
    rejectReimbursementSchema,
} from '../validators/reembolso.schema';
import {createAnexoSchema} from '../validators/anexo.schema';

const router = Router();
const ctrl = new ReembolsoController();
const anexoCtrl = new AnexoController();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', perfilMiddleware('COLABORADOR'), validate(createReimbursementSchema), ctrl.create);
router.get('/:id', ctrl.findById);
router.put('/:id', perfilMiddleware('COLABORADOR'), validate(updateReimbursementSchema), ctrl.update);
router.post('/:id/submit', perfilMiddleware('COLABORADOR'), ctrl.submit);
router.post('/:id/cancel', perfilMiddleware('COLABORADOR'), ctrl.cancel);
router.post('/:id/approve', perfilMiddleware('GESTOR'), ctrl.approve);
router.post('/:id/reject', perfilMiddleware('GESTOR'), validate(rejectReimbursementSchema), ctrl.reject);
router.post('/:id/pay', perfilMiddleware('FINANCEIRO'), ctrl.pay);
router.get('/:id/history', ctrl.history);
router.post('/:id/attachments', perfilMiddleware('COLABORADOR'), validate(createAnexoSchema), anexoCtrl.create);
router.get('/:id/attachments', anexoCtrl.list);

export default router;
