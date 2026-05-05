import {Request, Response, NextFunction} from 'express';
import {getContainer} from '../../../shared/container';

export class CategoriaController {
    async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const categorias = await getContainer().listarCategoriasUseCase.execute();
            res.json(categorias.map(c => c.props));
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await getContainer().criarCategoriaUseCase.execute(req.body.nome);
            res.status(201).json(category.props);
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await getContainer().atualizarCategoriaUseCase.execute(
                Number(req.params.id),
                req.body,
            );
            res.json(category.props);
        } catch (err) {
            next(err);
        }
    }
}
