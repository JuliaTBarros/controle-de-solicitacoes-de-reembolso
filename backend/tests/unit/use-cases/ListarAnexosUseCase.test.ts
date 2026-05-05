import { ListarAnexosUseCase } from '../../../src/application/use-cases/reembolso/ListarAnexosUseCase';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { Role } from '../../../src/domain/entities/Usuario';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';
import { Anexo } from '../../../src/domain/entities/Anexo';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    anexo: { create: jest.fn(), findBySolicitacaoId: jest.fn(), findById: jest.fn(), delete: jest.fn() },
});

const buildReembolso = (solicitanteId = 1) =>
    new SolicitacaoDeReembolso({
        id: 1, solicitanteId, categoriaId: 1, descricao: 'Despesa',
        valor: 100, dataDespesa: new Date(), status: ReembolsoStatus.RASCUNHO,
        criadoEm: new Date(), atualizadoEm: new Date(),
    });

const anexosMock: Anexo[] = [
    new Anexo({ id: 1, solicitacaoId: 1, nomeArquivo: 'nota.pdf', urlArquivo: 'https://storage/nota.pdf', tipoArquivo: 'PDF', criadoEm: new Date() }),
    new Anexo({ id: 2, solicitacaoId: 1, nomeArquivo: 'recibo.jpg', urlArquivo: 'https://storage/recibo.jpg', tipoArquivo: 'JPG', criadoEm: new Date() }),
];

const colaborador = (sub: string) => ({ sub, perfil: Role.COLABORADOR });
const gestor = { sub: '99', perfil: Role.GESTOR };
const financeiro = { sub: '99', perfil: Role.FINANCEIRO };

describe('ListarAnexosUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: ListarAnexosUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new ListarAnexosUseCase(repos.reembolso, repos.anexo);
    });

    it('retorna lista de anexos para o dono da solicitação', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.anexo.findBySolicitacaoId.mockResolvedValue(anexosMock);

        const result = await useCase.execute(1, colaborador('1'));

        expect(result).toBe(anexosMock);
        expect(result).toHaveLength(2);
    });

    it('GESTOR pode listar anexos de qualquer solicitação', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.anexo.findBySolicitacaoId.mockResolvedValue(anexosMock);

        const result = await useCase.execute(1, gestor);

        expect(result).toBe(anexosMock);
    });

    it('FINANCEIRO pode listar anexos de qualquer solicitação', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.anexo.findBySolicitacaoId.mockResolvedValue(anexosMock);

        const result = await useCase.execute(1, financeiro);

        expect(result).toBeDefined();
    });

    it('retorna lista vazia quando não há anexos', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.anexo.findBySolicitacaoId.mockResolvedValue([]);

        const result = await useCase.execute(1, colaborador('1'));

        expect(result).toEqual([]);
    });

    it('consulta anexos pelo id da solicitação correto', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        repos.anexo.findBySolicitacaoId.mockResolvedValue([]);

        await useCase.execute(7, gestor);

        expect(repos.reembolso.findById).toHaveBeenCalledWith(7);
        expect(repos.anexo.findBySolicitacaoId).toHaveBeenCalledWith(7);
    });

    it('lança NotFoundError se solicitação não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);

        await expect(useCase.execute(99, gestor)).rejects.toThrow(NotFoundError);
    });

    it('não consulta anexos se solicitação não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);

        await expect(useCase.execute(99, gestor)).rejects.toThrow();

        expect(repos.anexo.findBySolicitacaoId).not.toHaveBeenCalled();
    });

    it('lança UnauthorizedError se COLABORADOR tentar ver anexos de outra solicitação', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(2));

        await expect(useCase.execute(1, colaborador('1'))).rejects.toThrow(UnauthorizedError);
    });

    it('não consulta anexos se COLABORADOR não tiver permissão', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(2));

        await expect(useCase.execute(1, colaborador('1'))).rejects.toThrow();

        expect(repos.anexo.findBySolicitacaoId).not.toHaveBeenCalled();
    });
});
