import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IHistoricoRepository, HistoryAction} from '../../../domain/repositories/IHistoricoRepository';
import {ICategoriaRepository} from '../../../domain/repositories/ICategoriaRepository';
import {ReembolsoStatus} from '../../../domain/value-objects/ReembolsoStatus';
import {Money} from '../../../domain/value-objects/Money';
import {UpdateReimbursementDTO} from '../../dtos/reembolso.dto';
import {DomainError} from '../../../domain/errors/DomainError';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';

export class AtualizarReembolsoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private categoriaRepository: ICategoriaRepository,
        private historicoRepository: IHistoricoRepository,
    ) {
    }

    async execute(id: number, solicitanteId: number, input: UpdateReimbursementDTO) {
        const reembolso = await this.reembolsoRepository.findById(id);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');
        if (reembolso.solicitanteId !== solicitanteId) throw new UnauthorizedError('Apenas o dono pode editar esta solicitação.');
        if (reembolso.status !== ReembolsoStatus.RASCUNHO) throw new DomainError('Apenas solicitações em rascunho podem ser editadas.', 400);

        if (input.valor !== undefined) Money.create(input.valor);

        if (input.categoriaId !== undefined) {
            const categoria = await this.categoriaRepository.findById(input.categoriaId);
            if (!categoria || !categoria.isActive()) throw new DomainError('Categoria não encontrada ou inativa.', 400);
        }

        const updated = await this.reembolsoRepository.update(id, {
            ...(input.categoriaId !== undefined && {categoriaId: input.categoriaId}),
            ...(input.descricao !== undefined && {descricao: input.descricao}),
            ...(input.valor !== undefined && {valor: input.valor}),
            ...(input.dataDespesa !== undefined && {dataDespesa: input.dataDespesa}),
        });

        await this.historicoRepository.create({
            solicitacaoId: id,
            usuarioId: solicitanteId,
            acao: HistoryAction.UPDATED,
            observacao: 'Solicitação atualizada.',
        });

        return updated;
    }
}
