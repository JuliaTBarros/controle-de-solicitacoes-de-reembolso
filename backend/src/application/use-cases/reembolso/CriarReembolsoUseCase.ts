import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {ICategoriaRepository} from '../../../domain/repositories/ICategoriaRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus} from '../../../domain/value-objects/ReembolsoStatus';
import {Dinheiro} from '../../../domain/value-objects/Dinheiro';
import {CreateReimbursementDTO} from '../../dtos/reembolso.dto';
import {DomainError} from '../../../domain/errors/DomainError';
import {NotFoundError} from "../../../domain/errors/NotFoundError";

export class CriarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private categoriaRepository: ICategoriaRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(input: CreateReimbursementDTO) {
        Dinheiro.create(input.valor);

        const categoria = await this.categoriaRepository.findById(input.categoriaId);
        if (!categoria) throw new
        NotFoundError('Categoria');
        if (!categoria.isActive()) throw new
        DomainError('Categoria inativa.', 400);

        const reembolso = await this.reembolsoRepository.create({
            solicitanteId: input.solicitanteId,
            categoriaId: input.categoriaId,
            descricao: input.descricao,
            valor: input.valor,
            dataDespesa: input.dataDespesa,
            status: ReembolsoStatus.RASCUNHO,
        });

        await this.historicoRepository.create({
            solicitacaoId: reembolso.id,
            usuarioId: input.solicitanteId,
            acao: HistoryAction.CREATED,
            observacao: 'Solicitação criada.',
        });

        return reembolso;
    }
}