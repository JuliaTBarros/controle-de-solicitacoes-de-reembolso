import {ICategoriaRepository} from '../../../domain/repositories/ICategoriaRepository';
import {Categoria} from '../../../domain/entities/Categoria';
import {NotFoundError} from '../../../domain/errors/NotFoundError';

export class AtualizarCategoriaUseCase {
    constructor(private categoriaRepository: ICategoriaRepository) {
    }

    async execute(id: number, data: { nome?: string; ativo?: boolean }): Promise<Categoria> {
        const existing = await this.categoriaRepository.findById(id);
        if (!existing) throw new NotFoundError('Categoria');
        return this.categoriaRepository.update(id, data);
    }
}
