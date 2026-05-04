import {Request, Response, NextFunction} from 'express';

export function perfilMiddleware(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !allowedRoles.includes(user.perfil)) {
            return res.status(403).json({
                message: 'Acesso negado para este perfil.',
                statusCode: 403,
                error: 'Forbidden',
            });
        }
        next();
    };
}
