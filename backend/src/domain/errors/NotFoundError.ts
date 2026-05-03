import {DomainError} from './DomainError';

export class NotFoundError extends DomainError {
    constructor(resource = 'Recurso') {
        super(`${resource} não encontrado.`, 404);
        this.name = 'NotFoundError';
    }
}