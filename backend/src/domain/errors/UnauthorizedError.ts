import {DomainError} from './DomainError';

export class UnauthorizedError extends DomainError {
    constructor(message = 'Ação não permitida para este perfil.') {
        super(message, 403);
        this.name = 'UnauthorizedError';
    }
}
