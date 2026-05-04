import {Role} from '../entities/Usuario';

export interface TokenPayload {
    sub: string;
    perfil: Role;
}

export interface ITokenService {
    sign(payload: TokenPayload): string;

    verify(token: string): TokenPayload;
}
