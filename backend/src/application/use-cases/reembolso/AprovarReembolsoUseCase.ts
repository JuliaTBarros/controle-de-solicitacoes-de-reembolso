import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus, isValidTransition} from '../../../domain/value-objects/ReembolsoStatus';
import {DomainError} from '../../../domain/errors/DomainError';
import {InvalidStatusTransitionError} from '../../../domain/errors/InvalidStatusTransitionError';

export class AprovarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(id: number, gestorId: number) {
        const reembolso = await this.reembolsoRepository.findById(id);
        if (!reembolso) throw new DomainError('Solicitação não encontrada.', 404);

        const from = reembolso.status;
        const to = ReembolsoStatus.APROVADO;
        if (!isValidTransition(from, to)) throw new InvalidStatusTransitionError(from, to);

        await this.reembolsoRepository.update(id, {status: to});
        await this.historicoRepository.create({
            solicitacaoId: id,
            usuarioId: gestorId,
            acao: HistoryAction.APPROVED,
            observacao: 'Solicitação aprovada pelo gestor.',
        });
    }
}