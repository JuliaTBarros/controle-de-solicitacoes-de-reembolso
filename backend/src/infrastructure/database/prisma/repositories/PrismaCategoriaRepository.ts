import {prisma} from '../client';
import {ICategoriaRepository} from '../../../../domain/repositories/ICategoriaRepository';
import {Categoria} from '../../../../domain/entities/Categoria';
import {DomainError} from '../../../../domain/errors/DomainError';
import {NotFoundError} from '../../../../domain/errors/NotFoundError';

type PrismaCategory = {
    id: number;
    nome: string;
    ativo: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
};

export class PrismaCategoriaRepository implements ICategoriaRepository {
    async create(data: { nome: string }): Promise<Categoria> {
        try {
            const record = await prisma.categoria.create({data});
            return this.toEntity(record);
        } catch (err: any) {
            if (err?.code === 'P2002') throw new DomainError('Já existe uma categoria com este nome.', 409);
            throw err;
        }
    }

    async findById(id: number): Promise<Categoria | null> {
        const record = await prisma.categoria.findUnique({where: {id: Number(id)}});
        return record ? this.toEntity(record) : null;
    }

    async findAll(): Promise<Categoria[]> {
        const records = await prisma.categoria.findMany();
        return records.map(r => this.toEntity(r));
    }

    async update(id: number, data: Partial<{ nome: string; ativo: boolean }>): Promise<Categoria> {
        try {
            const record = await prisma.categoria.update({where: {id: Number(id)}, data});
            return this.toEntity(record);
        } catch (err: any) {
            if (err?.code === 'P2025') throw new NotFoundError('Categoria');
            if (err?.code === 'P2002') throw new DomainError('Já existe uma categoria com este nome.', 409);
            throw err;
        }
    }

    private toEntity(record: PrismaCategory): Categoria {
        return new Categoria({
            id: Number(record.id),
            nome: record.nome,
            ativo: record.ativo,
            criadoEm: record.criadoEm,
            atualizadoEm: record.atualizadoEm,
        });
    }
}
