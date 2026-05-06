import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';
import {Role} from '../../../domain/entities/Usuario';
import {SolicitacaoDeReembolso} from '../../../domain/entities/SolicitacaoDeReembolso';
import {ReembolsoStatus} from '../../../domain/value-objects/ReembolsoStatus';

export class GetReembolsoByIdUseCase {
    constructor(private reembolsoRepository: IReembolsoRepository) {
    }

    async execute(id: number, usuario: { sub: string; perfil: Role }): Promise<SolicitacaoDeReembolso> {
        const reembolso = await this.reembolsoRepository.findById(id);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');

        if (usuario.perfil === Role.COLABORADOR && reembolso.solicitanteId !== Number(usuario.sub)) {
            throw new UnauthorizedError('Você não tem permissão para visualizar esta solicitação.');
        }

        const gestorStatuses = [ReembolsoStatus.ENVIADO, ReembolsoStatus.APROVADO, ReembolsoStatus.REJEITADO];
        if (usuario.perfil === Role.GESTOR && !gestorStatuses.includes(reembolso.status)) {
            throw new UnauthorizedError('Gestores só podem visualizar solicitações enviadas, aprovadas ou rejeitadas.');
        }

        const financeiroStatuses = [ReembolsoStatus.APROVADO, ReembolsoStatus.PAGO];
        if (usuario.perfil === Role.FINANCEIRO && !financeiroStatuses.includes(reembolso.status)) {
            throw new UnauthorizedError('Financeiro só pode visualizar solicitações aprovadas ou pagas.');
        }

        return reembolso;
    }
}
