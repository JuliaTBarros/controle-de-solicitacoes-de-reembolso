import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IAnexoRepository} from '../../../domain/repositories/IAnexoRepository';
import {Anexo} from '../../../domain/entities/Anexo';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';
import {Role} from '../../../domain/entities/Usuario';
import {ReembolsoStatus} from '../../../domain/value-objects/ReembolsoStatus';

export class ListarAnexosUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private anexoRepository: IAnexoRepository,
    ) {
    }

    async execute(solicitacaoId: number, usuario: { sub: string; perfil: Role }): Promise<Anexo[]> {
        const reembolso = await this.reembolsoRepository.findById(solicitacaoId);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');

        if (usuario.perfil === Role.COLABORADOR && reembolso.solicitanteId !== Number(usuario.sub)) {
            throw new UnauthorizedError('Você não tem permissão para visualizar os anexos desta solicitação.');
        }

        if (usuario.perfil === Role.GESTOR && reembolso.status !== ReembolsoStatus.ENVIADO) {
            throw new UnauthorizedError('Gestores só podem visualizar anexos de solicitações enviadas.');
        }

        if (usuario.perfil === Role.FINANCEIRO && reembolso.status !== ReembolsoStatus.APROVADO) {
            throw new UnauthorizedError('Financeiro só pode visualizar anexos de solicitações aprovadas.');
        }

        return this.anexoRepository.findBySolicitacaoId(solicitacaoId);
    }
}
