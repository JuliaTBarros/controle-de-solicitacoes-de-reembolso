import {ICategoriaRepository} from '../../../domain/repositories/ICategoriaRepository';
import {Categoria} from '../../../domain/entities/Categoria';
import {DomainError} from '../../../domain/errors/DomainError';

export class CriarCategoriaUseCase {
    constructor(private categoriaRepository: ICategoriaRepository) {
    }

    async execute(nome: string): Promise<Categoria> {
        const nomeTrimmed = nome.trim();
        if (nomeTrimmed.length < 2) {
            throw new DomainError('Nome da categoria deve ter pelo menos 2 caracteres.');
        }
        return this.categoriaRepository.create({nome: nomeTrimmed});
    }
}
