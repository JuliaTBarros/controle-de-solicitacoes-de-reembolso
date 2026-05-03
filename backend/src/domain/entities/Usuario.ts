export enum Role {
    COLABORADOR = 'COLABORADOR',
    GESTOR = 'GESTOR',
    FINANCEIRO = 'FINANCEIRO',
    ADMIN = 'ADMIN',
}

export interface UsuarioProps {
    id: number;
    nome: string;
    email: string;
    senha: string;
    perfil: Role;
    criadoEm: Date;
    atualizadoEm: Date;
}

export class Usuario {
    constructor(public readonly props: UsuarioProps) {
    }

    get id() {
        return this.props.id;
    }

    get role() {
        return this.props.perfil;
    }

    get email() {
        return this.props.email;
    }

    isColaborador() {
        return this.props.perfil === Role.COLABORADOR;
    }

    isGestor() {
        return this.props.perfil === Role.GESTOR;
    }

    isFinanceiro() {
        return this.props.perfil === Role.FINANCEIRO;
    }

    isAdmin() {
        return this.props.perfil === Role.ADMIN;
    }
}
