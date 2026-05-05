import request from 'supertest';
import app from '../../src/app';
import { getAdminToken, getColaboradorToken, getGestorToken, getFinanceiroToken } from '../helpers/tokens';

describe('Users API', () => {
    describe('POST /users', () => {
        it('cria usuário com sucesso sem autenticação', async () => {
            const email = `novo_${Date.now()}@test.com`;
            const res = await request(app).post('/users').send({
                nome: 'Novo Usuário',
                email,
                senha: '123456',
            });

            expect(res.status).toBe(201);
            expect(res.body.email).toBe(email);
            expect(res.body.perfil).toBe('COLABORADOR');
            expect(res.body.senha).toBeUndefined();
        });

        it('cria usuário com perfil GESTOR explícito', async () => {
            const res = await request(app).post('/users').send({
                nome: 'Gestor Novo',
                email: `gestor_${Date.now()}@test.com`,
                senha: '123456',
                perfil: 'GESTOR',
            });

            expect(res.status).toBe(201);
            expect(res.body.perfil).toBe('GESTOR');
        });

        it('retorna 409 para e-mail duplicado', async () => {
            const email = `dup_${Date.now()}@test.com`;
            await request(app).post('/users').send({ nome: 'Usuário', email, senha: '123456' });

            const res = await request(app).post('/users').send({ nome: 'Usuário2', email, senha: '123456' });
            expect(res.status).toBe(409);
        });

        it('retorna 400 com e-mail inválido', async () => {
            const res = await request(app).post('/users').send({
                nome: 'Usuário',
                email: 'invalido',
                senha: '123456',
            });
            expect(res.status).toBe(400);
        });

        it('retorna 400 com senha muito curta', async () => {
            const res = await request(app).post('/users').send({
                nome: 'Usuário',
                email: 'valido@test.com',
                senha: '123',
            });
            expect(res.status).toBe(400);
        });

        it('retorna 400 com nome muito curto', async () => {
            const res = await request(app).post('/users').send({
                nome: 'A',
                email: 'valido2@test.com',
                senha: '123456',
            });
            expect(res.status).toBe(400);
        });

        it('retorna 400 com perfil inválido', async () => {
            const res = await request(app).post('/users').send({
                nome: 'Usuário',
                email: 'valido3@test.com',
                senha: '123456',
                perfil: 'SUPERADMIN',
            });
            expect(res.status).toBe(400);
        });
    });

    describe('GET /users', () => {
        let adminToken: string;
        let colaboradorToken: string;
        let gestorToken: string;
        let financeiroToken: string;

        beforeAll(async () => {
            [adminToken, colaboradorToken, gestorToken, financeiroToken] = await Promise.all([
                getAdminToken(),
                getColaboradorToken(),
                getGestorToken(),
                getFinanceiroToken(),
            ]);
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).get('/users');
            expect(res.status).toBe(401);
        });

        it('retorna 403 para COLABORADOR', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna 403 para GESTOR', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna 403 para FINANCEIRO', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${financeiroToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna lista de usuários para ADMIN', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('não expõe senha dos usuários na listagem', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            res.body.forEach((u: any) => expect(u.senha).toBeUndefined());
        });
    });
});
