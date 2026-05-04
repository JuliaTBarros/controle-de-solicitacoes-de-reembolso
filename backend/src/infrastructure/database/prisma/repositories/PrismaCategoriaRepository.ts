import {prisma} from '../client';
import {ICategoriaRepository} from '../../../../domain/repositories/ICategoriaRepository';
import {Categoria} from '../../../../domain/entities/Categoria';

type PrismaCategory = {
    id: number;
    nome: string;
    ativo: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
};

export class PrismaCategoriaRepository implements ICategoriaRepository {
    async create(data: { nome: string }): Promise<Categoria> {
        const record = await prisma.categoria.create({data});
        return this.toEntity(record);
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
        const record = await prisma.categoria.update({where: {id: Number(id)}, data});
        return this.toEntity(record);
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
