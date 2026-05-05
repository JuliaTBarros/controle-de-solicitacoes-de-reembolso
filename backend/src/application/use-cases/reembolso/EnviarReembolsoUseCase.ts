import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus, isValidTransition} from '../../../domain/value-objects/ReembolsoStatus';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {InvalidStatusTransitionError} from '../../../domain/errors/InvalidStatusTransitionError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';

export class EnviarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(id: number, solicitanteId: number) {
        const reembolso = await this.reembolsoRepository.findById(id);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');
        if (reembolso.solicitanteId !== solicitanteId) throw new UnauthorizedError('Apenas o dono pode enviar esta solicitação.');

        const from = reembolso.status;
        const to = ReembolsoStatus.ENVIADO;
        if (!isValidTransition(from, to)) throw new InvalidStatusTransitionError(from, to);

        const updated = await this.reembolsoRepository.update(id, {status: to});
        await this.historicoRepository.create({
            solicitacaoId: id,
            usuarioId: solicitanteId,
            acao: HistoryAction.SUBMITTED,
            observacao: 'Solicitação enviada para análise.',
        });
        return updated;
    }
}