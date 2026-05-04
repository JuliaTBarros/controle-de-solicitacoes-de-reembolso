import jwt from 'jsonwebtoken';
import {ITokenService, TokenPayload} from '../../domain/services/ITokenService';
import {DomainError} from '../../domain/errors/DomainError';

export class JwtTokenService implements ITokenService {
    private secret: string;
    private expiresIn: string;

    constructor() {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('JWT_SECRET não configurado. Defina a variável de ambiente antes de iniciar em produção.');
            }
            this.secret = 'fallback_secret_dev_only';
        } else {
            this.secret = secret;
        }
        this.expiresIn = process.env.JWT_EXPIRES_IN ?? '1d';
    }

    sign(payload: TokenPayload): string {
        return jwt.sign(payload, this.secret, {expiresIn: this.expiresIn} as jwt.SignOptions);
    }

    verify(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.secret) as TokenPayload;
        } catch {
            throw new DomainError('Token inválido ou expirado.', 401);
        }
    }
}
