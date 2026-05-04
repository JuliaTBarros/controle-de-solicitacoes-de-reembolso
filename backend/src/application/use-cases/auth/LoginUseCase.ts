import {IUsuarioRepository} from '../../../domain/repositories/IUsuarioRepository';
import {IHashService} from '../../../domain/services/IHashService';
import {ITokenService} from '../../../domain/services/ITokenService';
import {LoginInputDTO, LoginOutputDTO} from '../../dtos/auth.dto';
import {DomainError} from '../../../domain/errors/DomainError';

export class LoginUseCase {
    constructor(
        private usuarioRepository: IUsuarioRepository,
        private hashService: IHashService,
        private tokenService: ITokenService,
    ) {
    }

    async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
        const usuario = await this.usuarioRepository.findByEmail(input.email);
        if (!usuario) throw new DomainError('Credenciais inválidas.', 401);

        const valid = await this.hashService.compare(input.senha, usuario.props.senha);
        if (!valid) throw new DomainError('Credenciais inválidas.', 401);

        const token = this.tokenService.sign({sub: usuario.id.toString(), perfil: usuario.perfil});

        return {
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
            },
        };
    }
}
