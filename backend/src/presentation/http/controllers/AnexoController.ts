import {Request, Response, NextFunction} from 'express';
import {container} from '../../../shared/container';

export class AnexoController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            const result = await container.criarAnexoUseCase.execute({
                solicitacaoId: Number(req.params.id),
                solicitanteId: userId,
                nomeArquivo: req.body.nomeArquivo,
                urlArquivo: req.body.urlArquivo,
                tipoArquivo: req.body.tipoArquivo,
            });
            res.status(201).json(result.props);
        } catch (err) {
            next(err);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const results = await container.listarAnexosUseCase.execute(Number(req.params.id), user);
            res.json(results.map(a => a.props));
        } catch (err) {
            next(err);
        }
    }
}
