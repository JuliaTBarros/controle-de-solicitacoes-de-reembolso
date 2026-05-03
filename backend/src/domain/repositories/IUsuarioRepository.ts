import {Usuario} from '../entities/Usuario';

export interface IUsuarioRepository {
    create(data: Omit<Usuario['props'], 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Usuario>;

    findById(id: number): Promise<Usuario | null>;

    findByEmail(email: string): Promise<Usuario | null>;

    findAll(): Promise<Usuario[]>;

    update(id: number, data: Partial<Usuario['props']>): Promise<Usuario>;
}
