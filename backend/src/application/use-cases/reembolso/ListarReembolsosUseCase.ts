import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {Role} from '../../../domain/entities/Usuario';

export class ListarReembolsosUseCase {
    constructor(private reembolsoRepository: IReembolsoRepository) {
    }

    async execute(usuario: { sub: string; perfil: Role }) {
        const filtros = usuario.perfil === Role.COLABORADOR
            ? {solicitanteId: Number(usuario.sub)}
            : undefined;
        return this.reembolsoRepository.findAll(filtros);
    }
}
