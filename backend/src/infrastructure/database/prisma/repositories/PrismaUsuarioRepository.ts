import {prisma} from '../client';
import {IUsuarioRepository} from '../../../../domain/repositories/IUsuarioRepository';
import {Usuario, Role} from '../../../../domain/entities/Usuario';

type PrismaUser = {
    id: number;
    nome: string;
    email: string;
    senha: string;
    perfil: string;
    criadoEm: Date;
    atualizadoEm: Date;
};

export class PrismaUsuarioRepository implements IUsuarioRepository {
    async create(data: Omit<Usuario['props'], 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Usuario> {
        const record = await prisma.usuario.create({
            data: {
                nome: data.nome,
                email: data.email,
                senha: data.senha,
                perfil: data.perfil,
            },
        });
        return this.toEntity(record);
    }

    async findById(id: number): Promise<Usuario | null> {
        const record = await prisma.usuario.findUnique({where: {id: Number(id)}});
        return record ? this.toEntity(record) : null;
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        const record = await prisma.usuario.findUnique({where: {email}});
        return record ? this.toEntity(record) : null;
    }

    async findAll(): Promise<Usuario[]> {
        const records = await prisma.usuario.findMany();
        return records.map(r => this.toEntity(r));
    }

    async update(id: number, data: Partial<Usuario['props']>): Promise<Usuario> {
        const updateData: Record<string, unknown> = {};
        if (data.nome) updateData.nome = data.nome;
        if (data.email) updateData.email = data.email;
        if (data.senha) updateData.senha = data.senha;
        if (data.perfil) updateData.perfil = data.perfil;
        const record = await prisma.usuario.update({where: {id: Number(id)}, data: updateData});
        return this.toEntity(record);
    }

    private toEntity(record: PrismaUser): Usuario {
        return new Usuario({
            id: Number(record.id),
            nome: record.nome,
            email: record.email,
            senha: record.senha,
            perfil: record.perfil as Role,
            criadoEm: record.criadoEm,
            atualizadoEm: record.atualizadoEm,
        });
    }
}
