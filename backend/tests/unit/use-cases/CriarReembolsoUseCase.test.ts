import { CriarReembolsoUseCase } from '../../../src/application/use-cases/reembolso/CriarReembolsoUseCase';
import { DomainError } from '../../../src/domain/errors/DomainError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { Categoria } from '../../../src/domain/entities/Categoria';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';
import { HistoryAction } from '../../../src/domain/repositories/IHistoricoRepository';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    categoria: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    historico: { create: jest.fn(), findBySolicitacaoId: jest.fn() },
});

const categoriaAtiva = new Categoria({ id: 1, nome: 'Alimentação', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() });
const categoriaInativa = new Categoria({ id: 2, nome: 'Inativa', ativo: false, criadoEm: new Date(), atualizadoEm: new Date() });

const reembolsoMock = new SolicitacaoDeReembolso({
    id: 1, solicitanteId: 1, categoriaId: 1, descricao: 'Despesa teste',
    valor: 100, dataDespesa: new Date(), status: ReembolsoStatus.RASCUNHO,
    criadoEm: new Date(), atualizadoEm: new Date(),
});

const validInput = { solicitanteId: 1, categoriaId: 1, descricao: 'Despesa de teste', valor: 100, dataDespesa: new Date() };

describe('CriarReembolsoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: CriarReembolsoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new CriarReembolsoUseCase(repos.reembolso, repos.categoria, repos.historico);
    });

    it('cria reembolso com sucesso e registra histórico CREATED', async () => {
        repos.categoria.findById.mockResolvedValue(categoriaAtiva);
        repos.reembolso.create.mockResolvedValue(reembolsoMock);
        repos.historico.create.mockResolvedValue({});

        const result = await useCase.execute(validInput);

        expect(result).toBe(reembolsoMock);
        expect(repos.historico.create).toHaveBeenCalledWith(
            expect.objectContaining({ acao: HistoryAction.CREATED, solicitacaoId: 1 })
        );
    });

    it('status inicial é RASCUNHO', async () => {
        repos.categoria.findById.mockResolvedValue(categoriaAtiva);
        repos.reembolso.create.mockResolvedValue(reembolsoMock);
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(validInput);

        const createCall = repos.reembolso.create.mock.calls[0][0];
        expect(createCall.status).toBe(ReembolsoStatus.RASCUNHO);
    });

    it('lança DomainError para valor zero', async () => {
        await expect(useCase.execute({ ...validInput, valor: 0 })).rejects.toThrow(DomainError);
    });

    it('lança DomainError para valor negativo', async () => {
        await expect(useCase.execute({ ...validInput, valor: -50 })).rejects.toThrow(DomainError);
    });

    it('lança DomainError se categoria não existir', async () => {
        repos.categoria.findById.mockResolvedValue(null);
        await expect(useCase.execute(validInput)).rejects.toThrow(DomainError);
    });

    it('lança DomainError se categoria estiver inativa', async () => {
        repos.categoria.findById.mockResolvedValue(categoriaInativa);
        await expect(useCase.execute(validInput)).rejects.toThrow(DomainError);
    });

    it('não cria reembolso se valor inválido (sem chamar o repositório)', async () => {
        await expect(useCase.execute({ ...validInput, valor: 0 })).rejects.toThrow();
        expect(repos.reembolso.create).not.toHaveBeenCalled();
    });
});
