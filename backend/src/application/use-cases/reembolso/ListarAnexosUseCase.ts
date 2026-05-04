import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IAnexoRepository} from '../../../domain/repositories/IAnexoRepository';
import {Anexo} from '../../../domain/entities/Anexo';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';
import {Role} from '../../../domain/entities/Usuario';

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

        return this.anexoRepository.findBySolicitacaoId(solicitacaoId);
    }
}
