import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus, isValidTransition} from '../../../domain/value-objects/ReembolsoStatus';
import {DomainError} from '../../../domain/errors/DomainError';
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
        if (!reembolso) throw new DomainError('Solicitação não encontrada.', 404);

        const from = reembolso.status;
        const to = ReembolsoStatus.REJEITADO;
        if (!isValidTransition(from, to)) throw new InvalidStatusTransitionError(from, to);

        await this.reembolsoRepository.update(id, {
            status: to,
            justificativaRejeicao: input.justificativaRejeicao,
        });
        await this.historicoRepository.create({
            solicitacaoId: id,
            usuarioId: gestorId,
            acao: HistoryAction.REJECTED,
            observacao: input.justificativaRejeicao,
        });
    }
}