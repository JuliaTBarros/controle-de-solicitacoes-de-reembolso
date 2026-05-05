import {Request, Response, NextFunction} from 'express';
import {getContainer} from '../../../shared/container';

export class AuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await getContainer().loginUseCase.execute(req.body);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}
