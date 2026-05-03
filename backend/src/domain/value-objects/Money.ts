export class Money {
    private constructor(private readonly valor: number) {
    }

    static create(valor: number): Money {
        if (valor <= 0) {
            throw new Error('O valor deve ser maior que zero.');
        }
        return new Money(valor);
    }

    toNumber() {
        return this.valor;
    }
}
