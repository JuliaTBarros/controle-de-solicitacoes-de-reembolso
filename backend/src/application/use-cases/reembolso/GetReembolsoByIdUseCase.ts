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

        if (usuario.perfil === Role.GESTOR && reembolso.status !== ReembolsoStatus.ENVIADO) {
            throw new UnauthorizedError('Gestores só podem visualizar solicitações enviadas.');
        }

        if (usuario.perfil === Role.FINANCEIRO && reembolso.status !== ReembolsoStatus.APROVADO) {
            throw new UnauthorizedError('Financeiro só pode visualizar solicitações aprovadas.');
        }

        return reembolso;
    }
}
