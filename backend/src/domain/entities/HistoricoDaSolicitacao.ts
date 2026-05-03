import {HistoryAction} from "../repositories/IHistoricoRepository";

export interface HistoricoDaSolicitacaoProps {
    id: number;
    solicitacaoId: number;
    usuarioId: number;
    acao: HistoryAction;
    observacao?: string;
    criadoEm: Date;
}

export class HistoricoDaSolicitacao {
    constructor(public readonly props: HistoricoDaSolicitacaoProps) {
    }

    get id() {
        return this.props.id;
    }

    get solicitacaoId() {
        return this.props.solicitacaoId;
    }

    get usuarioId() {
        return this.props.usuarioId;
    }

    get acao() {
        return this.props.acao;
    }

    get observacao() {
        return this.props.observacao;
    }

    get criadoEm() {
        return this.props.criadoEm;
    }
}