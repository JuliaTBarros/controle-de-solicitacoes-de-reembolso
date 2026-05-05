import request from 'supertest';
import app from '../../src/app';

export async function getToken(email: string, senha: string): Promise<string> {
    const res = await request(app).post('/auth/login').send({email, senha});
    return res.body.token as string;
}

export const getColaboradorToken = () => getToken('colaborador@test.com', '123456');
export const getColaborador2Token = () => getToken('colaborador2@test.com', '123456');
export const getGestorToken = () => getToken('gestor@test.com', '123456');
export const getFinanceiroToken = () => getToken('financeiro@test.com', '123456');
export const getAdminToken = () => getToken('admin@test.com', '123456');
