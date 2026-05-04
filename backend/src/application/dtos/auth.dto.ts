export interface LoginInputDTO {
    email: string;
    senha: string;
}

export interface LoginOutputDTO {
    token: string;
    user: {
        id: number;
        nome: string;
        email: string;
        perfil: string;
    };
}

export interface RegisterUserInputDTO {
    nome: string;
    email: string;
    senha: string;
    perfil?: string;
}
