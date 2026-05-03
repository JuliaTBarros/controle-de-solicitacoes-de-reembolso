export interface TokenPayload {
    sub: string;
    perfil: string;
}

export interface ITokenService {
    sign(payload: TokenPayload): string;

    verify(token: string): TokenPayload;
}
