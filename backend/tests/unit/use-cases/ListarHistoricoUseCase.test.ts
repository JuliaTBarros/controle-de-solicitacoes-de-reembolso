import { ListarHistoricoUseCase } from '../../../src/application/use-cases/reembolso/ListarHistoricoUseCase';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { Role } from '../../../src/domain/entities/Usuario';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';
import { HistoryAction, HistoryEntry } from '../../../src/domain/repositories/IHistoricoRepository';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    historico: { create: jest.fn(), findBySolicitacaoId: jest.fn() },
});

const buildReembolso = (solicitanteId = 1) =>
    new SolicitacaoDeReembolso({
        id: 1, solicitanteId, categoriaId: 1, descricao: 'Despesa',
        valor: 100, dataDespesa: new Date(), status: ReembolsoStatus.RASCUNHO,
        criadoEm: new Date(), atualizadoEm: new Date(),
    });

const historicoMock: HistoryEntry[] = [
    { id: 1, solicitacaoId: 1, usuarioId: 1, acao: HistoryAction.CREATED, criadoEm: new Date() },
    { id: 2, solicitacaoId: 1, usuarioId: 1, acao: HistoryAction.UPDATED, criadoEm: new Date() },
    { id: 3, solicitacaoId: 1, usuarioId: 2, acao: HistoryAction.APPROVED, criadoEm: new Date() },
];

const colaborador = (sub: string) => ({ sub, perfil: Role.COLABORADOR });
const gestor = { sub: '99', perfil: Role.GESTOR };
const financeiro = { sub: '99', perfil: Role.FINANCEIRO };

describe('ListarHistoricoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: ListarHistoricoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new ListarHistoricoUseCase(repos.reembolso, repos.historico);
    });

    it('retorna o histórico completo para o dono da solicitação', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.historico.findBySolicitacaoId.mockResolvedValue(historicoMock);

        const result = await useCase.execute(1, colaborador('1'));

        expect(result).toBe(historicoMock);
        expect(result).toHaveLength(3);
    });

    it('GESTOR pode ver histórico de qualquer solicitação', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.historico.findBySolicitacaoId.mockResolvedValue(historicoMock);

        const result = await useCase.execute(1, gestor);

        expect(result).toBe(historicoMock);
    });

    it('FINANCEIRO pode ver histórico de qualquer solicitação', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.historico.findBySolicitacaoId.mockResolvedValue(historicoMock);

        const result = await useCase.execute(1, financeiro);

        expect(result).toBeDefined();
    });

    it('retorna histórico vazio quando não há registros', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.historico.findBySolicitacaoId.mockResolvedValue([]);

        const result = await useCase.execute(1, colaborador('1'));

        expect(result).toEqual([]);
    });

    it('consulta histórico pelo id da solicitação correto', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.historico.findBySolicitacaoId.mockResolvedValue([]);

        await useCase.execute(5, gestor);

        expect(repos.reembolso.findById).toHaveBeenCalledWith(5);
        expect(repos.historico.findBySolicitacaoId).toHaveBeenCalledWith(5);
    });

    it('lança NotFoundError se solicitação não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);

        await expect(useCase.execute(99, gestor)).rejects.toThrow(NotFoundError);
    });

    it('não consulta histórico se a solicitação não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);

        await expect(useCase.execute(99, gestor)).rejects.toThrow();

        expect(repos.historico.findBySolicitacaoId).not.toHaveBeenCalled();
    });

    it('lança UnauthorizedError se COLABORADOR tentar ver histórico de outra solicitação', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(2));

        await expect(useCase.execute(1, colaborador('1'))).rejects.toThrow(UnauthorizedError);
    });

    it('não consulta histórico se COLABORADOR não tiver permissão', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(2));

        await expect(useCase.execute(1, colaborador('1'))).rejects.toThrow();

        expect(repos.historico.findBySolicitacaoId).not.toHaveBeenCalled();
    });
});
