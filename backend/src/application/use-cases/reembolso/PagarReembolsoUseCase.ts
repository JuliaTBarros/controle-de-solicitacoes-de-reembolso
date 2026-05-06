import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus, isValidTransition} from '../../../domain/value-objects/ReembolsoStatus';
import {Role} from '../../../domain/entities/Usuario';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {InvalidStatusTransitionError} from '../../../domain/errors/InvalidStatusTransitionError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';

export class PagarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(id: number, usuario: { sub: string; perfil: Role }) {
        if (usuario.perfil !== Role.FINANCEIRO) throw new UnauthorizedError('Apenas o financeiro pode marcar solicitações como pagas.');

        const reembolso = await this.reembolsoRepository.findById(id);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');

        const from = reembolso.status;
        const to = ReembolsoStatus.PAGO;
        if (!isValidTransition(from, to)) throw new InvalidStatusTransitionError(from, to);

        const updated = await this.reembolsoRepository.update(id, {status: to});
        await this.historicoRepository.create({
            solicitacaoId: id,
            usuarioId: Number(usuario.sub),
            acao: HistoryAction.PAID,
            observacao: 'Pagamento realizado pelo financeiro.',
        });
        return updated;
    }
}