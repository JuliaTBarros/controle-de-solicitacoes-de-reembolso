import { AtualizarReembolsoUseCase } from '../../../src/application/use-cases/reembolso/AtualizarReembolsoUseCase';
import { DomainError } from '../../../src/domain/errors/DomainError';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { Categoria } from '../../../src/domain/entities/Categoria';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';
import { HistoryAction } from '../../../src/domain/repositories/IHistoricoRepository';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    categoria: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    historico: { create: jest.fn(), findBySolicitacaoId: jest.fn() },
});

const buildReembolso = (status: ReembolsoStatus, solicitanteId = 1) =>
    new SolicitacaoDeReembolso({
        id: 1, solicitanteId, categoriaId: 1, descricao: 'Despesa',
        valor: 100, dataDespesa: new Date(), status,
        criadoEm: new Date(), atualizadoEm: new Date(),
    });

const categoriaAtiva = new Categoria({ id: 2, nome: 'Transporte', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() });
const categoriaInativa = new Categoria({ id: 3, nome: 'Inativa', ativo: false, criadoEm: new Date(), atualizadoEm: new Date() });

describe('AtualizarReembolsoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: AtualizarReembolsoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new AtualizarReembolsoUseCase(repos.reembolso, repos.categoria, repos.historico);
    });

    it('atualiza reembolso em RASCUNHO com sucesso', async () => {
        const rascunho = buildReembolso(ReembolsoStatus.RASCUNHO);
        repos.reembolso.findById.mockResolvedValue(rascunho);
        repos.reembolso.update.mockResolvedValue(rascunho);
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(1, 1, { descricao: 'Nova descrição' });

        expect(repos.reembolso.update).toHaveBeenCalled();
    });

    it('registra histórico UPDATED ao atualizar com sucesso', async () => {
        const rascunho = buildReembolso(ReembolsoStatus.RASCUNHO);
        repos.reembolso.findById.mockResolvedValue(rascunho);
        repos.reembolso.update.mockResolvedValue(rascunho);
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(1, 1, { descricao: 'Nova descrição' });

        expect(repos.historico.create).toHaveBeenCalledWith(
            expect.objectContaining({ acao: HistoryAction.UPDATED, solicitacaoId: 1 })
        );
    });

    it('lança NotFoundError se reembolso não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);
        await expect(useCase.execute(99, 1, {})).rejects.toThrow(NotFoundError);
    });

    it('lança UnauthorizedError se não for o dono', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO, 2));
        await expect(useCase.execute(1, 1, {})).rejects.toThrow(UnauthorizedError);
    });

    it('lança DomainError se status não for RASCUNHO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        await expect(useCase.execute(1, 1, {})).rejects.toThrow(DomainError);
    });

    it('lança DomainError para valor zero ao atualizar', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        await expect(useCase.execute(1, 1, { valor: 0 })).rejects.toThrow(DomainError);
    });

    it('lança DomainError para categoria inativa', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        repos.categoria.findById.mockResolvedValue(categoriaInativa);
        await expect(useCase.execute(1, 1, { categoriaId: 3 })).rejects.toThrow(DomainError);
    });

    it('lança DomainError para categoria inexistente', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        repos.categoria.findById.mockResolvedValue(null);
        await expect(useCase.execute(1, 1, { categoriaId: 999 })).rejects.toThrow(DomainError);
    });

    it('aceita categoria ativa ao atualizar', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        repos.categoria.findById.mockResolvedValue(categoriaAtiva);
        repos.reembolso.update.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        repos.historico.create.mockResolvedValue({});

        await expect(useCase.execute(1, 1, { categoriaId: 2 })).resolves.not.toThrow();
    });
});
