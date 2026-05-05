import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus, isValidTransition} from '../../../domain/value-objects/ReembolsoStatus';
import {DomainError} from '../../../domain/errors/DomainError';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {InvalidStatusTransitionError} from '../../../domain/errors/InvalidStatusTransitionError';
import {RejectReimbursementDTO} from '../../dtos/reembolso.dto';

export class RejeitarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(id: number, gestorId: number, input: RejectReimbursementDTO) {
        const reembolso = await this.reembolsoRepository.findById(id);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');

        const from = reembolso.status;
        const to = ReembolsoStatus.REJEITADO;
        if (!isValidTransition(from, to)) throw new InvalidStatusTransitionError(from, to);

        if (!input.justificativaRejeicao?.trim()) {
            throw new DomainError('A justificativa de rejeição é obrigatória.');
        }

        const updated = await this.reembolsoRepository.update(id, {
            status: to,
            justificativaRejeicao: input.justificativaRejeicao,
        });
        await this.historicoRepository.create({
            solicitacaoId: id,
            usuarioId: gestorId,
            acao: HistoryAction.REJECTED,
            observacao: input.justificativaRejeicao,
        });
        return updated;
    }
}