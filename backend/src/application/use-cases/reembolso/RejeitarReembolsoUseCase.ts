import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus, isValidTransition} from '../../../domain/value-objects/ReembolsoStatus';
import {Role} from '../../../domain/entities/Usuario';
import {DomainError} from '../../../domain/errors/DomainError';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {InvalidStatusTransitionError} from '../../../domain/errors/InvalidStatusTransitionError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';
import {RejectReimbursementDTO} from '../../dtos/reembolso.dto';

export class RejeitarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(id: number, usuario: { sub: string; perfil: Role }, input: RejectReimbursementDTO) {
        if (usuario.perfil !== Role.GESTOR) throw new UnauthorizedError('Apenas gestores podem rejeitar solicitações.');

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
            usuarioId: Number(usuario.sub),
            acao: HistoryAction.REJECTED,
            observacao: input.justificativaRejeicao,
        });
        return updated;
    }
}