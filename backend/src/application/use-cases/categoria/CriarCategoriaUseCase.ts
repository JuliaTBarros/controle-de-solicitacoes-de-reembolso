import {ICategoriaRepository} from '../../../domain/repositories/ICategoriaRepository';
import {Categoria} from '../../../domain/entities/Categoria';

export class CriarCategoriaUseCase {
    constructor(private categoriaRepository: ICategoriaRepository) {
    }

    async execute(nome: string): Promise<Categoria> {
        return this.categoriaRepository.create({nome: nome.trim()});
    }
}
