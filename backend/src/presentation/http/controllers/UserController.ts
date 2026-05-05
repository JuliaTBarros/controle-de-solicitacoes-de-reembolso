import {Request, Response, NextFunction} from 'express';
import {getContainer} from '../../../shared/container';

export class UserController {
    async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const usuarios = await getContainer().listarUsuariosUseCase.execute();
            res.json(usuarios.map(u => ({
                id: u.id,
                nome: u.nome,
                email: u.email,
                perfil: u.perfil,
            })));
        } catch (err) {
            next(err);
        }
    }
}
