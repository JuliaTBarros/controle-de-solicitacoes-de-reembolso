import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {ICategoriaRepository} from '../../../domain/repositories/ICategoriaRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ReembolsoStatus} from '../../../domain/value-objects/ReembolsoStatus';
import {Money} from '../../../domain/value-objects/Money';
import {CreateReimbursementDTO} from '../../dtos/reembolso.dto';
import {DomainError} from '../../../domain/errors/DomainError';

export class CriarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private categoriaRepository: ICategoriaRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(input: CreateReimbursementDTO) {
        Money.create(input.valor);

        const categoria = await this.categoriaRepository.findById(input.categoriaId);
        if (!categoria || !categoria.isActive()) {
            throw new DomainError('Categoria não encontrada ou inativa.', 400);
        }

        const reembolso = await this.reembolsoRepository.create({
            solicitanteId: input.solicitanteId,
            categoriaId: input.categoriaId,
            descricao: input.descricao,
            valor: input.valor,
            dataDespesa: new Date(input.dataDespesa),
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