import {prisma} from '../client';
import {IHistoricoRepository, HistoryAction, HistoryEntry} from '../../../../domain/repositories/IHistoricoRepository';

type PrismaHistory = {
    id: number;
    solicitacaoId: number;
    usuarioId: number;
    acao: string;
    observacao: string | null;
    criadoEm: Date;
};

export class PrismaHistoricoRepository implements IHistoricoRepository {
    async create(data: Omit<HistoryEntry, 'id' | 'criadoEm'>): Promise<HistoryEntry> {
        const record = await prisma.historicoDaSolicitacao.create({
            data: {
                solicitacaoId: Number(data.solicitacaoId),
                usuarioId: Number(data.usuarioId),
                acao: data.acao,
                observacao: data.observacao,
            },
        });
        return this.toEntity(record);
    }

    async findBySolicitacaoId(solicitacaoId: number): Promise<HistoryEntry[]> {
        const records = await prisma.historicoDaSolicitacao.findMany({
            where: {solicitacaoId: Number(solicitacaoId)},
        });
        return records.map(r => this.toEntity(r));
    }

    private toEntity(record: PrismaHistory): HistoryEntry {
        return {
            id: Number(record.id),
            solicitacaoId: Number(record.solicitacaoId),
            usuarioId: Number(record.usuarioId),
            acao: record.acao as HistoryAction,
            observacao: record.observacao ?? undefined,
            criadoEm: record.criadoEm,
        };
    }
}
