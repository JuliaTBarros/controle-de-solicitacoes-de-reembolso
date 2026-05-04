import {Request, Response, NextFunction} from 'express';
import {DomainError} from '../../../domain/errors/DomainError';
import {ZodError} from 'zod';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: err.errors.map(e => e.message).join(', '),
            statusCode: 400,
            error: 'Bad Request',
        });
    }

    if (err instanceof DomainError) {
        return res.status(err.statusCode).json({
            message: err.message,
            statusCode: err.statusCode,
            error: err.name,
        });
    }

    console.error(err);
    return res.status(500).json({
        message: 'Erro interno no servidor.',
        statusCode: 500,
        error: 'Internal Server Error'
    });
}
