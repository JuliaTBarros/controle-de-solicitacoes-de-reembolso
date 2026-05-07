import {ICategoriaRepository} from '../../../domain/repositories/ICategoriaRepository';
import {Categoria} from '../../../domain/entities/Categoria';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {DomainError} from '../../../domain/errors/DomainError';

export class AtualizarCategoriaUseCase {
    constructor(private categoriaRepository: ICategoriaRepository) {
    }

    async execute(id: number, data: { nome?: string; ativo?: boolean }): Promise<Categoria> {
        const existing = await this.categoriaRepository.findById(id);
        if (!existing) throw new NotFoundError('Categoria');

        if (data.nome !== undefined) {
            const nomeTrimmed = data.nome.trim();
            if (nomeTrimmed.length < 2) {
                throw new DomainError('Nome da categoria deve ter pelo menos 2 caracteres.');
            }
            data = {...data, nome: nomeTrimmed};
        }

        return this.categoriaRepository.update(id, data);
    }
}
