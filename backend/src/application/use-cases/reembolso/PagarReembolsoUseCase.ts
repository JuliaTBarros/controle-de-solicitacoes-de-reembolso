import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus, isValidTransition} from '../../../domain/value-objects/ReembolsoStatus';
import {DomainError} from '../../../domain/errors/DomainError';
import {InvalidStatusTransitionError} from '../../../domain/errors/InvalidStatusTransitionError';

export class PagarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(id: number, financeiroId: number) {
        const reembolso = await this.reembolsoRepository.findById(id);
        if (!reembolso) throw new DomainError('Solicitação não encontrada.', 404);

        const from = reembolso.status;
        const to = ReembolsoStatus.PAGO;
        if (!isValidTransition(from, to)) throw new InvalidStatusTransitionError(from, to);

        await this.reembolsoRepository.update(id, {status: to});
        await this.historicoRepository.create({
            solicitacaoId: id,
            usuarioId: financeiroId,
            acao: HistoryAction.PAID,
            observacao: 'Pagamento realizado pelo financeiro.',
        });
    }
}