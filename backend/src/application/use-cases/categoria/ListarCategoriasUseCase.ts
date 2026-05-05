import {ICategoriaRepository} from '../../../domain/repositories/ICategoriaRepository';
import {Categoria} from '../../../domain/entities/Categoria';

export class ListarCategoriasUseCase {
    constructor(private categoriaRepository: ICategoriaRepository) {
    }

    async execute(): Promise<Categoria[]> {
        return this.categoriaRepository.findAll();
    }
}
