import {ReembolsoStatus} from '../value-objects/ReembolsoStatus';

export interface ReembolsoProps {
    id: number;
    solicitanteId: number;
    categoriaId: number;
    descricao: string;
    valor: number;
    dataDespesa: Date;
    status: ReembolsoStatus;
    justificativaRejeicao?: string;
    criadoEm: Date;
    atualizadoEm: Date;
}

export class SolicitacaoDeReembolso {
    constructor(public readonly props: ReembolsoProps) {
    }

    get id() {
        return this.props.id;
    }

    get status() {
        return this.props.status;
    }

    get solicitanteId() {
        return this.props.solicitanteId;
    }

    isDraft() {
        return this.props.status === ReembolsoStatus.RASCUNHO;
    }

    isSubmitted() {
        return this.props.status === ReembolsoStatus.ENVIADO;
    }

    isApproved() {
        return this.props.status === ReembolsoStatus.APROVADO;
    }

    isRejected() {
        return this.props.status === ReembolsoStatus.REJEITADO;
    }

    isPaid() {
        return this.props.status === ReembolsoStatus.PAGO;
    }

    isCanceled() {
        return this.props.status === ReembolsoStatus.CANCELADO;
    }
}