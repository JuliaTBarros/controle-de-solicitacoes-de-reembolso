import {IUsuarioRepository} from '../../../domain/repositories/IUsuarioRepository';
import {Usuario} from '../../../domain/entities/Usuario';

export class ListarUsuariosUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) {
    }

    async execute(): Promise<Usuario[]> {
        return this.usuarioRepository.findAll();
    }
}
