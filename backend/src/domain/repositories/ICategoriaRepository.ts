import {Categoria} from '../entities/Categoria';

export interface ICategoriaRepository {
    create(data: { nome: string }): Promise<Categoria>;

    findById(id: number): Promise<Categoria | null>;

    findAll(): Promise<Categoria[]>;

    update(id: number, data: Partial<{ nome: string; ativo: boolean }>): Promise<Categoria>;
}
