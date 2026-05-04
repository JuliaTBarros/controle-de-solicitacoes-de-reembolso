import {DomainError} from '../errors/DomainError';

export class Money {
    private constructor(private readonly valor: number) {
    }

    static create(valor: number): Money {
        if (valor <= 0) {
            throw new DomainError('O valor deve ser maior que zero.', 400);
        }
        return new Money(valor);
    }

    toNumber() {
        return this.valor;
    }
}
