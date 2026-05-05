import { ListarReembolsosUseCase } from '../../../src/application/use-cases/reembolso/ListarReembolsosUseCase';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { Role } from '../../../src/domain/entities/Usuario';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
});

const buildReembolso = (id: number, solicitanteId: number, status: ReembolsoStatus) =>
    new SolicitacaoDeReembolso({
        id, solicitanteId, categoriaId: 1, descricao: 'Despesa',
        valor: 100, dataDespesa: new Date(), status,
        criadoEm: new Date(), atualizadoEm: new Date(),
    });

describe('ListarReembolsosUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: ListarReembolsosUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new ListarReembolsosUseCase(repos.reembolso);
    });

    describe('COLABORADOR', () => {
        const usuario = { sub: '3', perfil: Role.COLABORADOR };

        it('busca apenas as próprias solicitações pelo solicitanteId', async () => {
            repos.reembolso.findAll.mockResolvedValue([]);

            await useCase.execute(usuario);

            expect(repos.reembolso.findAll).toHaveBeenCalledWith({ solicitanteId: 3 });
        });

        it('retorna as solicitações do próprio usuário', async () => {
            const lista = [buildReembolso(1, 3, ReembolsoStatus.RASCUNHO)];
            repos.reembolso.findAll.mockResolvedValue(lista);

            const result = await useCase.execute(usuario);

            expect(result).toBe(lista);
        });

        it('converte sub (string) para número ao filtrar', async () => {
            repos.reembolso.findAll.mockResolvedValue([]);

            await useCase.execute({ sub: '42', perfil: Role.COLABORADOR });

            expect(repos.reembolso.findAll).toHaveBeenCalledWith({ solicitanteId: 42 });
        });
    });

    describe('GESTOR', () => {
        const usuario = { sub: '10', perfil: Role.GESTOR };

        it('busca apenas solicitações com status ENVIADO', async () => {
            repos.reembolso.findAll.mockResolvedValue([]);

            await useCase.execute(usuario);

            expect(repos.reembolso.findAll).toHaveBeenCalledWith({ status: ReembolsoStatus.ENVIADO });
        });

        it('retorna lista de reembolsos enviados', async () => {
            const lista = [buildReembolso(1, 1, ReembolsoStatus.ENVIADO)];
            repos.reembolso.findAll.mockResolvedValue(lista);

            const result = await useCase.execute(usuario);

            expect(result).toBe(lista);
        });
    });

    describe('FINANCEIRO', () => {
        const usuario = { sub: '20', perfil: Role.FINANCEIRO };

        it('busca apenas solicitações com status APROVADO', async () => {
            repos.reembolso.findAll.mockResolvedValue([]);

            await useCase.execute(usuario);

            expect(repos.reembolso.findAll).toHaveBeenCalledWith({ status: ReembolsoStatus.APROVADO });
        });

        it('retorna lista de reembolsos aprovados', async () => {
            const lista = [buildReembolso(1, 1, ReembolsoStatus.APROVADO)];
            repos.reembolso.findAll.mockResolvedValue(lista);

            const result = await useCase.execute(usuario);

            expect(result).toBe(lista);
        });
    });

    describe('ADMIN', () => {
        const usuario = { sub: '1', perfil: Role.ADMIN };

        it('busca todas as solicitações sem filtro', async () => {
            repos.reembolso.findAll.mockResolvedValue([]);

            await useCase.execute(usuario);

            expect(repos.reembolso.findAll).toHaveBeenCalledWith();
        });

        it('retorna todas as solicitações independente do status', async () => {
            const lista = [
                buildReembolso(1, 1, ReembolsoStatus.RASCUNHO),
                buildReembolso(2, 2, ReembolsoStatus.APROVADO),
                buildReembolso(3, 3, ReembolsoStatus.PAGO),
            ];
            repos.reembolso.findAll.mockResolvedValue(lista);

            const result = await useCase.execute(usuario);

            expect(result).toBe(lista);
            expect(result).toHaveLength(3);
        });
    });
});
