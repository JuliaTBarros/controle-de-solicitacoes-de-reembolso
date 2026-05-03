export interface CategoryProps {
    id: number;
    nome: string;
    ativo: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
}

export class Categoria {
    constructor(public readonly props: CategoryProps) {
    }

    get id() {
        return this.props.id;
    }

    get active() {
        return this.props.ativo;
    }

    isActive() {
        return this.props.ativo;
    }
}
