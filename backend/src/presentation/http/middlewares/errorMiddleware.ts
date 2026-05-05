import {Request, Response, NextFunction} from 'express';
import {DomainError} from '../../../domain/errors/DomainError';
import {ZodError} from 'zod';

function httpErrorName(statusCode: number): string {
    switch (statusCode) {
        case 400: return 'Bad Request';
        case 401: return 'Unauthorized';
        case 403: return 'Forbidden';
        case 404: return 'Not Found';
        default: return 'Bad Request';
    }
}

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
            error: httpErrorName(err.statusCode),
        });
    }

    console.error(err);
    return res.status(500).json({
        message: 'Erro interno no servidor.',
        statusCode: 500,
        error: 'Internal Server Error'
    });
}
