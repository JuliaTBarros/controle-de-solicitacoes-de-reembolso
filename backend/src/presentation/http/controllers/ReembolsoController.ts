import {Request, Response, NextFunction} from 'express';
import {container} from '../../../shared/container';

export class ReembolsoController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            const result = await container.createReimbursementUseCase.execute({
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
            const result = await container.updateReimbursementUseCase.execute(
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
            await container.submitReimbursementUseCase.execute(Number(req.params.id), userId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await container.cancelReimbursementUseCase.execute(Number(req.params.id), userId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async approve(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await container.approveReimbursementUseCase.execute(Number(req.params.id), userId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async reject(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await container.rejectReimbursementUseCase.execute(Number(req.params.id), userId, req.body);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async pay(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number((req as any).user.sub);
            await container.payReimbursementUseCase.execute(Number(req.params.id), userId);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const result = await container.listReimbursementsUseCase.execute(user);
            res.json(result.map(r => r.props));
        } catch (err) {
            next(err);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const record = await container.getReimbursementByIdUseCase.execute(Number(req.params.id), user);
            res.json(record.props);
        } catch (err) {
            next(err);
        }
    }

    async history(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user;
            const result = await container.listHistoricoUseCase.execute(Number(req.params.id), user);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}
