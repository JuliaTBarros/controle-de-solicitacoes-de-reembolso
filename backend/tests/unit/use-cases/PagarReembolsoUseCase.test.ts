import { PagarReembolsoUseCase } from '../../../src/application/use-cases/reembolso/PagarReembolsoUseCase';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { InvalidStatusTransitionError } from '../../../src/domain/errors/InvalidStatusTransitionError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { Role } from '../../../src/domain/entities/Usuario';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';
import { HistoryAction } from '../../../src/domain/repositories/IHistoricoRepository';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    historico: { create: jest.fn(), findBySolicitacaoId: jest.fn() },
});

const buildReembolso = (status: ReembolsoStatus) =>
    new SolicitacaoDeReembolso({
        id: 1, solicitanteId: 1, categoriaId: 1, descricao: 'Despesa',
        valor: 100, dataDespesa: new Date(), status,
        criadoEm: new Date(), atualizadoEm: new Date(),
    });

const financeiro = { sub: '3', perfil: Role.FINANCEIRO };
const gestor = { sub: '3', perfil: Role.GESTOR };

describe('PagarReembolsoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: PagarReembolsoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new PagarReembolsoUseCase(repos.reembolso, repos.historico);
    });

    it('paga reembolso APROVADO com sucesso e registra PAID', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.APROVADO));
        repos.reembolso.update.mockResolvedValue({});
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(1, financeiro);

        expect(repos.reembolso.update).toHaveBeenCalledWith(1, { status: ReembolsoStatus.PAGO });
        expect(repos.historico.create).toHaveBeenCalledWith(
            expect.objectContaining({ acao: HistoryAction.PAID, usuarioId: 3 })
        );
    });

    it('lança UnauthorizedError se perfil não for FINANCEIRO', async () => {
        await expect(useCase.execute(1, gestor)).rejects.toThrow(UnauthorizedError);
        expect(repos.reembolso.findById).not.toHaveBeenCalled();
    });

    it('lança NotFoundError se reembolso não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);
        await expect(useCase.execute(99, financeiro)).rejects.toThrow(NotFoundError);
    });

    it('lança InvalidStatusTransitionError para ENVIADO → PAGO (sem aprovação)', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        await expect(useCase.execute(1, financeiro)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para RASCUNHO → PAGO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        await expect(useCase.execute(1, financeiro)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para REJEITADO → PAGO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.REJEITADO));
        await expect(useCase.execute(1, financeiro)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('não registra histórico se a transição for inválida', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        await expect(useCase.execute(1, financeiro)).rejects.toThrow();
        expect(repos.historico.create).not.toHaveBeenCalled();
    });
});
