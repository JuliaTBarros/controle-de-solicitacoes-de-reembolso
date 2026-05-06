import { AprovarReembolsoUseCase } from '../../../src/application/use-cases/reembolso/AprovarReembolsoUseCase';
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

const gestor = { sub: '2', perfil: Role.GESTOR };
const colaborador = { sub: '2', perfil: Role.COLABORADOR };

describe('AprovarReembolsoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: AprovarReembolsoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new AprovarReembolsoUseCase(repos.reembolso, repos.historico);
    });

    it('aprova reembolso ENVIADO com sucesso e registra APPROVED', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        repos.reembolso.update.mockResolvedValue({});
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(1, gestor);

        expect(repos.reembolso.update).toHaveBeenCalledWith(1, { status: ReembolsoStatus.APROVADO });
        expect(repos.historico.create).toHaveBeenCalledWith(
            expect.objectContaining({ acao: HistoryAction.APPROVED, usuarioId: 2 })
        );
    });

    it('lança UnauthorizedError se perfil não for GESTOR', async () => {
        await expect(useCase.execute(1, colaborador)).rejects.toThrow(UnauthorizedError);
        expect(repos.reembolso.findById).not.toHaveBeenCalled();
    });

    it('lança NotFoundError se reembolso não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);
        await expect(useCase.execute(99, gestor)).rejects.toThrow(NotFoundError);
    });

    it('lança InvalidStatusTransitionError para RASCUNHO → APROVADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        await expect(useCase.execute(1, gestor)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para APROVADO → APROVADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.APROVADO));
        await expect(useCase.execute(1, gestor)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para PAGO → APROVADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.PAGO));
        await expect(useCase.execute(1, gestor)).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('não registra histórico se a transição for inválida', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        await expect(useCase.execute(1, gestor)).rejects.toThrow();
        expect(repos.historico.create).not.toHaveBeenCalled();
    });
});
