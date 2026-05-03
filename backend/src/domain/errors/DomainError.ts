// Classe base para todos os erros de domínio.

export class DomainError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 400,
    ) {
        super(message);
        this.name = 'DomainError';
    }
}
