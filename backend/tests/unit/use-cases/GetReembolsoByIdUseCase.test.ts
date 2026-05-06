import { GetReembolsoByIdUseCase } from '../../../src/application/use-cases/reembolso/GetReembolsoByIdUseCase';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { Role } from '../../../src/domain/entities/Usuario';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
});

const buildReembolso = (solicitanteId = 1, status = ReembolsoStatus.RASCUNHO) =>
    new SolicitacaoDeReembolso({
        id: 1, solicitanteId, categoriaId: 1, descricao: 'Despesa',
        valor: 150, dataDespesa: new Date(), status,
        criadoEm: new Date(), atualizadoEm: new Date(),
    });

const colaborador = (sub: string) => ({ sub, perfil: Role.COLABORADOR });
const gestor = { sub: '99', perfil: Role.GESTOR };
const financeiro = { sub: '99', perfil: Role.FINANCEIRO };
const admin = { sub: '99', perfil: Role.ADMIN };

describe('GetReembolsoByIdUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: GetReembolsoByIdUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new GetReembolsoByIdUseCase(repos.reembolso);
    });

    it('retorna o reembolso quando encontrado e o solicitante é o dono', async () => {
        const reembolso = buildReembolso(1);
        repos.reembolso.findById.mockResolvedValue(reembolso);

        const result = await useCase.execute(1, colaborador('1'));

        expect(result).toBe(reembolso);
        expect(repos.reembolso.findById).toHaveBeenCalledWith(1);
    });

    it('GESTOR pode visualizar solicitação com status ENVIADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.ENVIADO));
        const result = await useCase.execute(1, gestor);
        expect(result).toBeDefined();
    });

    it('GESTOR pode visualizar solicitação com status APROVADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.APROVADO));
        const result = await useCase.execute(1, gestor);
        expect(result).toBeDefined();
    });

    it('GESTOR pode visualizar solicitação com status REJEITADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.REJEITADO));
        const result = await useCase.execute(1, gestor);
        expect(result).toBeDefined();
    });

    it('lança UnauthorizedError se GESTOR tentar visualizar solicitação em RASCUNHO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.RASCUNHO));
        await expect(useCase.execute(1, gestor)).rejects.toThrow(UnauthorizedError);
    });

    it('lança UnauthorizedError se GESTOR tentar visualizar solicitação em CANCELADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.CANCELADO));
        await expect(useCase.execute(1, gestor)).rejects.toThrow(UnauthorizedError);
    });

    it('FINANCEIRO pode visualizar solicitação com status APROVADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.APROVADO));
        const result = await useCase.execute(1, financeiro);
        expect(result).toBeDefined();
    });

    it('FINANCEIRO pode visualizar solicitação com status PAGO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.PAGO));
        const result = await useCase.execute(1, financeiro);
        expect(result).toBeDefined();
    });

    it('lança UnauthorizedError se FINANCEIRO tentar visualizar solicitação em ENVIADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.ENVIADO));
        await expect(useCase.execute(1, financeiro)).rejects.toThrow(UnauthorizedError);
    });

    it('lança UnauthorizedError se FINANCEIRO tentar visualizar solicitação em RASCUNHO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1, ReembolsoStatus.RASCUNHO));
        await expect(useCase.execute(1, financeiro)).rejects.toThrow(UnauthorizedError);
    });

    it('ADMIN pode visualizar reembolso de qualquer solicitante e status', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        const result = await useCase.execute(1, admin);
        expect(result).toBeDefined();
    });

    it('lança NotFoundError se reembolso não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);
        await expect(useCase.execute(99, gestor)).rejects.toThrow(NotFoundError);
    });

    it('lança UnauthorizedError se COLABORADOR tentar ver reembolso de outro usuário', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(2));
        await expect(useCase.execute(1, colaborador('1'))).rejects.toThrow(UnauthorizedError);
    });

    it('não lança UnauthorizedError se COLABORADOR visualizar o próprio reembolso', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(5));
        await expect(useCase.execute(1, colaborador('5'))).resolves.not.toThrow();
    });

    it('não chama o repositório de update', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(1));
        await useCase.execute(1, colaborador('1'));
        expect(repos.reembolso.update).not.toHaveBeenCalled();
    });
});
