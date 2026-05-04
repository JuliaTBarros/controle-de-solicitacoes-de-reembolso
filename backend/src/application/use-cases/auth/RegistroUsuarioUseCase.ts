import {IUsuarioRepository} from '../../../domain/repositories/IUsuarioRepository';
import {IHashService} from '../../../domain/services/IHashService';
import {RegisterUserInputDTO} from '../../dtos/auth.dto';
import {DomainError} from '../../../domain/errors/DomainError';
import {Role} from '../../../domain/entities/Usuario';

export class RegistroUsuarioUseCase {
    constructor(
        private usuarioRepository: IUsuarioRepository,
        private hashService: IHashService,
    ) {
    }

    async execute(input: RegisterUserInputDTO) {
        const existing = await this.usuarioRepository.findByEmail(input.email);
        if (existing) throw new DomainError('E-mail já cadastrado.', 409);

        const senha = await this.hashService.hash(input.senha);
        const perfil = (input.perfil as Role) ?? Role.COLABORADOR;

        const usuario = await this.usuarioRepository.create({
            nome: input.nome,
            email: input.email,
            senha,
            perfil,
        });

        return {id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil};
    }
}
