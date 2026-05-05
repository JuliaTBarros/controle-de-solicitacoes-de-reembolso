import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus, isValidTransition} from '../../../domain/value-objects/ReembolsoStatus';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {InvalidStatusTransitionError} from '../../../domain/errors/InvalidStatusTransitionError';

export class PagarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(id: number, financeiroId: number) {
        const reembolso = await this.reembolsoRepository.findById(id);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');

        const from = reembolso.status;
        const to = ReembolsoStatus.PAGO;
        if (!isValidTransition(from, to)) throw new InvalidStatusTransitionError(from, to);

        const updated = await this.reembolsoRepository.update(id, {status: to});
        await this.historicoRepository.create({
            solicitacaoId: id,
            usuarioId: financeiroId,
            acao: HistoryAction.PAID,
            observacao: 'Pagamento realizado pelo financeiro.',
        });
        return updated;
    }
}