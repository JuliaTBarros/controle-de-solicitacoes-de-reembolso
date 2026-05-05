import {Request, Response, NextFunction} from 'express';
import {getContainer} from '../../../shared/container';

export class ReembolsoController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            const result = await getContainer().criarReembolsoUseCase.execute({
                ...req.body,
                solicitanteId: userId,
                dataDespesa: new Date(req.body.dataDespesa),
            });
            res.status(201).json(result.props);
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            const input = {
                ...req.body,
                ...(req.body.dataDespesa && {dataDespesa: new Date(req.body.dataDespesa)}),
            };
            const result = await getContainer().atualizarReembolsoUseCase.execute(
                Number(req.params.id),
                userId,
                input,
            );
            res.json(result.props);
        } catch (err) {
            next(err);
        }
    }

    async submit(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await getContainer().enviarReembolsoUseCase.execute(Number(req.params.id), userId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await getContainer().cancelarReembolsoUseCase.execute(Number(req.params.id), userId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await getContainer().aprovarReembolsoUseCase.execute(Number(req.params.id), userId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async reject(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await getContainer().rejeitarReembolsoUseCase.execute(Number(req.params.id), userId, req.body);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async pay(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await getContainer().pagarReembolsoUseCase.execute(Number(req.params.id), userId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const result = await getContainer().listarReembolsosUseCase.execute(user);
            res.json(result.map(r => r.props));
        } catch (err) {
            next(err);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const record = await getContainer().buscarReembolsoPorIdUseCase.execute(Number(req.params.id), user);
            res.json(record.props);
        } catch (err) {
            next(err);
        }
    }

    async history(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const result = await getContainer().listarHistoricoUseCase.execute(Number(req.params.id), user);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}
