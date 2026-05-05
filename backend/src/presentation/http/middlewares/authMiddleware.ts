import {Request, Response, NextFunction} from 'express';
import {getContainer} from '../../../shared/container';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Token não fornecido.', statusCode: 401, error: 'Unauthorized'});
    }

    try {
        const token = header.split(' ')[1];
        const payload = getContainer().servicoDeToken.verify(token);
        (req as any).user = payload;
        next();
    } catch (err: any) {
        return res.status(401).json({message: err.message, statusCode: 401, error: 'Unauthorized'});
    }
}
