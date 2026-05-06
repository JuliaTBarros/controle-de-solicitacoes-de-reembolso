import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryEntry} from '../../../domain/repositories/IHistoricoRepository';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';
import {Role} from '../../../domain/entities/Usuario';
import {ReembolsoStatus} from '../../../domain/value-objects/ReembolsoStatus';

export class ListarHistoricoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(solicitacaoId: number, usuario: { sub: string; perfil: Role }): Promise<HistoryEntry[]> {
        const reembolso = await this.reembolsoRepository.findById(solicitacaoId);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');

        if (usuario.perfil === Role.COLABORADOR && reembolso.solicitanteId !== Number(usuario.sub)) {
            throw new UnauthorizedError('Você não tem permissão para visualizar o histórico desta solicitação.');
        }

        const gestorStatuses = [ReembolsoStatus.ENVIADO, ReembolsoStatus.APROVADO, ReembolsoStatus.REJEITADO];
        if (usuario.perfil === Role.GESTOR && !gestorStatuses.includes(reembolso.status)) {
            throw new UnauthorizedError('Gestores só podem visualizar o histórico de solicitações enviadas, aprovadas ou rejeitadas.');
        }

        const financeiroStatuses = [ReembolsoStatus.APROVADO, ReembolsoStatus.PAGO];
        if (usuario.perfil === Role.FINANCEIRO && !financeiroStatuses.includes(reembolso.status)) {
            throw new UnauthorizedError('Financeiro só pode visualizar o histórico de solicitações aprovadas ou pagas.');
        }

        return this.historicoRepository.findBySolicitacaoId(solicitacaoId);
    }
}
