export interface CreateReimbursementDTO {
    solicitanteId: number;
    categoriaId: number;
    descricao: string;
    valor: number;
    dataDespesa: Date;
}

export interface UpdateReimbursementDTO {
    categoriaId?: number;
    descricao?: string;
    valor?: number;
    dataDespesa?: Date;
}

export interface RejectReimbursementDTO {
    justificativaRejeicao: string;
}