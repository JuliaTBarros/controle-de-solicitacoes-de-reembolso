import {Request, Response, NextFunction} from 'express';
import {container} from '../../../shared/container';

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await container.loginUseCase.execute(req.body);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await container.registerUserUseCase.execute(req.body);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    }
}
