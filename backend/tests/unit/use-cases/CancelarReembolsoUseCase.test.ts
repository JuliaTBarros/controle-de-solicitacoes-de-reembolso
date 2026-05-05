import { CancelarReembolsoUseCase } from '../../../src/application/use-cases/reembolso/CancelarReembolsoUseCase';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { InvalidStatusTransitionError } from '../../../src/domain/errors/InvalidStatusTransitionError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';
import { HistoryAction } from '../../../src/domain/repositories/IHistoricoRepository';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    historico: { create: jest.fn(), findBySolicitacaoId: jest.fn() },
});

const buildReembolso = (status: ReembolsoStatus, solicitanteId = 1) =>
    new SolicitacaoDeReembolso({
        id: 1, solicitanteId, categoriaId: 1, descricao: 'Despesa',
        valor: 100, dataDespesa: new Date(), status,
        criadoEm: new Date(), atualizadoEm: new Date(),
    });

describe('CancelarReembolsoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: CancelarReembolsoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new CancelarReembolsoUseCase(repos.reembolso, repos.historico);
    });

    it('cancela reembolso RASCUNHO com sucesso e registra CANCELED', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        repos.reembolso.update.mockResolvedValue({});
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(1, 1);

        expect(repos.reembolso.update).toHaveBeenCalledWith(1, { status: ReembolsoStatus.CANCELADO });
        expect(repos.historico.create).toHaveBeenCalledWith(
            expect.objectContaining({ acao: HistoryAction.CANCELED })
        );
    });

    it('cancela reembolso ENVIADO com sucesso', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        repos.reembolso.update.mockResolvedValue({});
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(1, 1);

        expect(repos.reembolso.update).toHaveBeenCalledWith(1, { status: ReembolsoStatus.CANCELADO });
    });

    it('lança NotFoundError se reembolso não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);
        await expect(useCase.execute(99, 1)).rejects.toThrow(NotFoundError);
    });

    it('lança UnauthorizedError se não for o dono', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO, 2));
        await expect(useCase.execute(1, 1)).rejects.toThrow(UnauthorizedError);
    });

    it('lança InvalidStatusTransitionError para PAGO → CANCELADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.PAGO));
        await expect(useCase.execute(1, 1)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para APROVADO → CANCELADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.APROVADO));
        await expect(useCase.execute(1, 1)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para REJEITADO → CANCELADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.REJEITADO));
        await expect(useCase.execute(1, 1)).rejects.toThrow(InvalidStatusTransitionError);
    });
});
