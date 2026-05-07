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
import {idParamsSchema} from '../validators/shared.schema';

const router = Router();
const ctrl = new ReembolsoController();
const anexoCtrl = new AnexoController();

router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', perfilMiddleware('COLABORADOR'), validate(createReimbursementSchema), ctrl.create);
router.get('/:id', validate(idParamsSchema), ctrl.findById);
router.put('/:id', perfilMiddleware('COLABORADOR'), validate(updateReimbursementSchema), ctrl.update);
router.post('/:id/submit', perfilMiddleware('COLABORADOR'), validate(idParamsSchema), ctrl.submit);
router.post('/:id/cancel', perfilMiddleware('COLABORADOR'), validate(idParamsSchema), ctrl.cancel);
router.post('/:id/approve', perfilMiddleware('GESTOR'), validate(idParamsSchema), ctrl.approve);
router.post('/:id/reject', perfilMiddleware('GESTOR'), validate(rejectReimbursementSchema), ctrl.reject);
router.post('/:id/pay', perfilMiddleware('FINANCEIRO'), validate(idParamsSchema), ctrl.pay);
router.get('/:id/history', validate(idParamsSchema), ctrl.history);
router.post('/:id/attachments', perfilMiddleware('COLABORADOR'), validate(createAnexoSchema), anexoCtrl.create);
router.get('/:id/attachments', validate(idParamsSchema), anexoCtrl.list);

export default router;
