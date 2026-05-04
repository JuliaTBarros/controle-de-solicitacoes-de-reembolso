import {Router, Request, Response, NextFunction} from 'express';
import {authMiddleware} from '../middlewares/authMiddleware';
import {perfilMiddleware} from '../middlewares/perfilMiddleware';
import {container} from '../../../shared/container';

const router = Router();

router.use(authMiddleware);

router.get('/', perfilMiddleware('ADMIN'), async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await container.userRepository.findAll();
        res.json(users.map(u => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            perfil: u.perfil,
        })));
    } catch (err) {
        next(err);
    }
});

export default router;
