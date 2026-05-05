import { DomainError } from '../../../src/domain/errors/DomainError';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { InvalidStatusTransitionError } from '../../../src/domain/errors/InvalidStatusTransitionError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';

describe('DomainError', () => {
    it('armazena mensagem e statusCode', () => {
        const err = new DomainError('falhou', 422);
        expect(err.message).toBe('falhou');
        expect(err.statusCode).toBe(422);
        expect(err).toBeInstanceOf(Error);
    });
});

describe('NotFoundError', () => {
    it('usa recurso personalizado na mensagem', () => {
        const err = new NotFoundError('Usuário');
        expect(err.message).toBe('Usuário não encontrado.');
        expect(err.statusCode).toBe(404);
        expect(err.name).toBe('NotFoundError');
    });

    it('usa "Recurso" como padrão quando nenhum argumento é passado', () => {
        const err = new NotFoundError();
        expect(err.message).toBe('Recurso não encontrado.');
        expect(err.statusCode).toBe(404);
    });

    it('é instância de DomainError', () => {
        expect(new NotFoundError()).toBeInstanceOf(DomainError);
    });
});

describe('UnauthorizedError', () => {
    it('usa mensagem personalizada', () => {
        const err = new UnauthorizedError('Sem permissão.');
        expect(err.message).toBe('Sem permissão.');
        expect(err.statusCode).toBe(403);
        expect(err.name).toBe('UnauthorizedError');
    });

    it('usa mensagem padrão quando nenhum argumento é passado', () => {
        const err = new UnauthorizedError();
        expect(err.message).toBe('Ação não permitida para este perfil.');
        expect(err.statusCode).toBe(403);
    });

    it('é instância de DomainError', () => {
        expect(new UnauthorizedError()).toBeInstanceOf(DomainError);
    });
});

describe('InvalidStatusTransitionError', () => {
    it('descreve a transição inválida na mensagem', () => {
        const err = new InvalidStatusTransitionError(ReembolsoStatus.PAGO, ReembolsoStatus.RASCUNHO);
        expect(err.message).toContain(ReembolsoStatus.PAGO);
        expect(err.message).toContain(ReembolsoStatus.RASCUNHO);
        expect(err.statusCode).toBe(400);
    });

    it('é instância de DomainError', () => {
        expect(new InvalidStatusTransitionError(ReembolsoStatus.PAGO, ReembolsoStatus.RASCUNHO))
            .toBeInstanceOf(DomainError);
    });
});
