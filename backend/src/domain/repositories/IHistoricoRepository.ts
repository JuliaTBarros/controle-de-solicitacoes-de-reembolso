export enum HistoryAction {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PAID = 'PAID',
    CANCELED = 'CANCELED',
}

export interface HistoryEntry {
    id: number;
    solicitacaoId: number;
    usuarioId: number;
    acao: HistoryAction;
    observacao?: string;
    criadoEm: Date;
}

export interface IHistoricoRepository {
    create(data: Omit<HistoryEntry, 'id' | 'criadoEm'>): Promise<HistoryEntry>;

    findBySolicitacaoId(solicitacaoId: number): Promise<HistoryEntry[]>;
}