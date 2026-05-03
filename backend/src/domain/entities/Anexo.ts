export interface AnexoProps {
    id: number;
    solicitacaoId: number;
    nomeArquivo: string;
    urlArquivo: string;
    tipoArquivo: string;
    criadoEm: Date;
}

export class Anexo {
    constructor(public readonly props: AnexoProps) {
    }

    get id() {
        return this.props.id;
    }

    get solicitacaoId() {
        return this.props.solicitacaoId;
    }

    get nomeArquivo() {
        return this.props.nomeArquivo;
    }

    get urlArquivo() {
        return this.props.urlArquivo;
    }

    get tipoArquivo() {
        return this.props.tipoArquivo;
    }

    get criadoEm() {
        return this.props.criadoEm;
    }
}