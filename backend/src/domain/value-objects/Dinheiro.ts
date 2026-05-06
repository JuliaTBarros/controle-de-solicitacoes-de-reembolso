import {DomainError} from '../errors/DomainError';

export class Dinheiro {
    private constructor(private readonly valor: number) {
    }

    static create(valor: number): Dinheiro {
        if (valor <= 0) {
            throw new DomainError('O valor deve ser maior que zero.', 400);
        }
        return new Dinheiro(valor);
    }

    toNumber() {
        return this.valor;
    }
}
