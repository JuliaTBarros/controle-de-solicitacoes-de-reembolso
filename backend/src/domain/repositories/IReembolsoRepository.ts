import {SolicitacaoDeReembolso} from '../entities/SolicitacaoDeReembolso';
import {ReembolsoStatus} from '../value-objects/ReembolsoStatus';

export interface ListReimbursementsFilters {
    solicitanteId?: number;
    status?: ReembolsoStatus;
    categoriaId?: number;
}

export interface IReembolsoRepository {
    create(data: Omit<SolicitacaoDeReembolso['props'], 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<SolicitacaoDeReembolso>;

    findById(id: number): Promise<SolicitacaoDeReembolso | null>;

    findAll(filters?: ListReimbursementsFilters): Promise<SolicitacaoDeReembolso[]>;

    update(id: number, data: Partial<SolicitacaoDeReembolso['props']>): Promise<SolicitacaoDeReembolso>;
}