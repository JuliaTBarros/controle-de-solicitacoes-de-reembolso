import {prisma} from '../client';
import {IReembolsoRepository, ListReimbursementsFilters} from '../../../../domain/repositories/IReembolsoRepository';
import {SolicitacaoDeReembolso} from '../../../../domain/entities/SolicitacaoDeReembolso';
import {ReembolsoStatus} from '../../../../domain/value-objects/ReembolsoStatus';

type PrismaReimbursement = {
    id: number;
    solicitanteId: number;
    categoriaId: number;
    descricao: string;
    valor: number;
    dataDespesa: Date;
    status: string;
    justificativaRejeicao: string | null;
    criadoEm: Date;
    atualizadoEm: Date;
};

export class PrismaReembolsoRepository implements IReembolsoRepository {
    async create(data: Omit<SolicitacaoDeReembolso['props'], 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<SolicitacaoDeReembolso> {
        const record = await prisma.solicitacaoDeReembolso.create({
            data: {
                solicitanteId: Number(data.solicitanteId),
                categoriaId: Number(data.categoriaId),
                descricao: data.descricao,
                valor: data.valor,
                dataDespesa: data.dataDespesa,
                status: data.status,
                justificativaRejeicao: data.justificativaRejeicao,
            },
        });
        return this.toEntity(record);
    }

    async findById(id: number): Promise<SolicitacaoDeReembolso | null> {
        const record = await prisma.solicitacaoDeReembolso.findUnique({where: {id: Number(id)}});
        return record ? this.toEntity(record) : null;
    }

    async findAll(filters?: ListReimbursementsFilters): Promise<SolicitacaoDeReembolso[]> {
        const where: { solicitanteId?: number; categoriaId?: number; status?: string | { in: string[] } } = {};
        if (filters?.solicitanteId) where.solicitanteId = Number(filters.solicitanteId);
        if (filters?.categoriaId) where.categoriaId = Number(filters.categoriaId);
        if (filters?.status) {
            where.status = Array.isArray(filters.status)
                ? { in: filters.status }
                : filters.status;
        }
        const records = await prisma.solicitacaoDeReembolso.findMany({where});
        return records.map(r => this.toEntity(r));
    }

    async update(id: number, data: Partial<SolicitacaoDeReembolso['props']>): Promise<SolicitacaoDeReembolso> {
        const updateData: Record<string, unknown> = {};
        if (data.descricao !== undefined) updateData.descricao = data.descricao;
        if (data.valor !== undefined) updateData.valor = data.valor;
        if (data.dataDespesa !== undefined) updateData.dataDespesa = data.dataDespesa;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.justificativaRejeicao !== undefined) updateData.justificativaRejeicao = data.justificativaRejeicao;
        if (data.solicitanteId !== undefined) updateData.solicitanteId = Number(data.solicitanteId);
        if (data.categoriaId !== undefined) updateData.categoriaId = Number(data.categoriaId);
        const record = await prisma.solicitacaoDeReembolso.update({where: {id: Number(id)}, data: updateData});
        return this.toEntity(record);
    }

    private toEntity(record: PrismaReimbursement): SolicitacaoDeReembolso {
        return new SolicitacaoDeReembolso({
            id: Number(record.id),
            solicitanteId: Number(record.solicitanteId),
            categoriaId: Number(record.categoriaId),
            descricao: record.descricao,
            valor: record.valor,
            dataDespesa: record.dataDespesa,
            status: record.status as ReembolsoStatus,
            justificativaRejeicao: record.justificativaRejeicao ?? undefined,
            criadoEm: record.criadoEm,
            atualizadoEm: record.atualizadoEm,
        });
    }
}
