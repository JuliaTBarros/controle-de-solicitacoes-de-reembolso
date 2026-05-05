import { EnviarReembolsoUseCase } from '../../../src/application/use-cases/reembolso/EnviarReembolsoUseCase';
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

describe('EnviarReembolsoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: EnviarReembolsoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new EnviarReembolsoUseCase(repos.reembolso, repos.historico);
    });

    it('envia reembolso RASCUNHO com sucesso e registra SUBMITTED', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        repos.reembolso.update.mockResolvedValue({});
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(1, 1);

        expect(repos.reembolso.update).toHaveBeenCalledWith(1, { status: ReembolsoStatus.ENVIADO });
        expect(repos.historico.create).toHaveBeenCalledWith(
            expect.objectContaining({ acao: HistoryAction.SUBMITTED })
        );
    });

    it('lança NotFoundError se reembolso não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);
        await expect(useCase.execute(99, 1)).rejects.toThrow(NotFoundError);
    });

    it('lança UnauthorizedError se não for o dono', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO, 2));
        await expect(useCase.execute(1, 1)).rejects.toThrow(UnauthorizedError);
    });

    it('lança InvalidStatusTransitionError se status não for RASCUNHO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        await expect(useCase.execute(1, 1)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para APROVADO → ENVIADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.APROVADO));
        await expect(useCase.execute(1, 1)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('não registra histórico se a transição falhar', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.PAGO));
        await expect(useCase.execute(1, 1)).rejects.toThrow();
        expect(repos.historico.create).not.toHaveBeenCalled();
    });
});
