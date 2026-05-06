import { RejeitarReembolsoUseCase } from '../../../src/application/use-cases/reembolso/RejeitarReembolsoUseCase';
import { DomainError } from '../../../src/domain/errors/DomainError';
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

const justificativa = 'Documentação incompleta.';
const gestor = { sub: '2', perfil: Role.GESTOR };
const colaborador = { sub: '2', perfil: Role.COLABORADOR };

describe('RejeitarReembolsoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: RejeitarReembolsoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new RejeitarReembolsoUseCase(repos.reembolso, repos.historico);
    });

    it('rejeita reembolso ENVIADO com sucesso e persiste justificativa', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        repos.reembolso.update.mockResolvedValue({});
        repos.historico.create.mockResolvedValue({});

        await useCase.execute(1, gestor, { justificativaRejeicao: justificativa });

        expect(repos.reembolso.update).toHaveBeenCalledWith(1, {
            status: ReembolsoStatus.REJEITADO,
            justificativaRejeicao: justificativa,
        });
        expect(repos.historico.create).toHaveBeenCalledWith(
            expect.objectContaining({ acao: HistoryAction.REJECTED, observacao: justificativa })
        );
    });

    it('lança UnauthorizedError se perfil não for GESTOR', async () => {
        await expect(useCase.execute(1, colaborador, { justificativaRejeicao: justificativa })).rejects.toThrow(UnauthorizedError);
        expect(repos.reembolso.findById).not.toHaveBeenCalled();
    });

    it('lança NotFoundError se reembolso não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);
        await expect(useCase.execute(99, gestor, { justificativaRejeicao: justificativa })).rejects.toThrow(NotFoundError);
    });

    it('lança InvalidStatusTransitionError para RASCUNHO → REJEITADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.RASCUNHO));
        await expect(useCase.execute(1, gestor, { justificativaRejeicao: justificativa })).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para APROVADO → REJEITADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.APROVADO));
        await expect(useCase.execute(1, gestor, { justificativaRejeicao: justificativa })).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança InvalidStatusTransitionError para PAGO → REJEITADO', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.PAGO));
        await expect(useCase.execute(1, gestor, { justificativaRejeicao: justificativa })).rejects.toThrow(InvalidStatusTransitionError);
    });

    it('lança DomainError quando justificativaRejeicao está vazia', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        await expect(useCase.execute(1, gestor, { justificativaRejeicao: '' })).rejects.toThrow(DomainError);
    });

    it('não persiste rejeição quando justificativa está ausente', async () => {
        repos.reembolso.findById.mockResolvedValue(buildReembolso(ReembolsoStatus.ENVIADO));
        await expect(useCase.execute(1, gestor, { justificativaRejeicao: '' })).rejects.toThrow();
        expect(repos.reembolso.update).not.toHaveBeenCalled();
    });
});
