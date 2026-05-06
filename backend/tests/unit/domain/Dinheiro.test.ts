import { Dinheiro } from '../../../src/domain/value-objects/Dinheiro';
import { DomainError } from '../../../src/domain/errors/DomainError';

describe('Dinheiro', () => {
    it('cria com valor positivo', () => {
        const m = Dinheiro.create(150.5);
        expect(m.toNumber()).toBe(150.5);
    });

    it('lança DomainError para valor zero', () => {
        expect(() => Dinheiro.create(0)).toThrow(DomainError);
    });

    it('lança DomainError para valor negativo', () => {
        expect(() => Dinheiro.create(-1)).toThrow(DomainError);
    });

    it('lança DomainError com statusCode 400', () => {
        expect.assertions(1);
        try {
            Dinheiro.create(-5);
        } catch (e: any) {
            expect(e.statusCode).toBe(400);
        }
    });

    it('cria com valor de ponto flutuante pequeno', () => {
        const m = Dinheiro.create(0.01);
        expect(m.toNumber()).toBe(0.01);
    });
});
