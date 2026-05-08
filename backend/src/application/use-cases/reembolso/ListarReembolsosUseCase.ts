import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {Role} from '../../../domain/entities/Usuario';
import {ReembolsoStatus} from '../../../domain/value-objects/ReembolsoStatus';

export class ListarReembolsosUseCase {
    constructor(private reembolsoRepository: IReembolsoRepository) {
    }

    async execute(usuario: { sub: string; perfil: Role }) {
        switch (usuario.perfil) {
            case Role.COLABORADOR:
                return this.reembolsoRepository.findAll({solicitanteId: Number(usuario.sub)});
            case Role.GESTOR:
                return this.reembolsoRepository.findAll({status: ReembolsoStatus.ENVIADO});
            case Role.FINANCEIRO:
                return this.reembolsoRepository.findAll({status: [ReembolsoStatus.APROVADO, ReembolsoStatus.PAGO]});
            default:
                return this.reembolsoRepository.findAll();
        }
    }
}
