import {Request, Response, NextFunction} from 'express';
import {container} from '../../../shared/container';

export class CategoriaController {
    async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const categorias = await container.categoryRepository.findAll();
            res.json(categorias.map(c => c.props));
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await container.criarCategoriaUseCase.execute(req.body.nome);
            res.status(201).json(category.props);
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await container.atualizarCategoriaUseCase.execute(
                Number(req.params.id),
                req.body,
            );
            res.json(category.props);
        } catch (err) {
            next(err);
        }
    }
}
