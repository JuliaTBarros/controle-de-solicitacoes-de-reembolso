import request from 'supertest';
import app from '../../src/app';
import { getAdminToken, getColaboradorToken, getGestorToken, getFinanceiroToken } from '../helpers/tokens';

describe('Categories API', () => {
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

    describe('GET /categories', () => {
        it('retorna 401 sem token', async () => {
            const res = await request(app).get('/categories');
            expect(res.status).toBe(401);
        });

        it('retorna lista de categorias para qualquer perfil autenticado', async () => {
            const res = await request(app)
                .get('/categories')
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('cada categoria possui id, nome e ativo', async () => {
            const res = await request(app)
                .get('/categories')
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.body[0]).toMatchObject({
                id: expect.any(Number),
                nome: expect.any(String),
                ativo: expect.any(Boolean),
            });
        });
    });

    describe('POST /categories', () => {
        it('retorna 401 sem token', async () => {
            const res = await request(app).post('/categories').send({ nome: 'Nova' });
            expect(res.status).toBe(401);
        });

        it('retorna 403 para COLABORADOR', async () => {
            const res = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ nome: 'Nova Categoria' });
            expect(res.status).toBe(403);
        });

        it('retorna 403 para GESTOR', async () => {
            const res = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${gestorToken}`)
                .send({ nome: 'Nova Categoria' });
            expect(res.status).toBe(403);
        });

        it('retorna 403 para FINANCEIRO', async () => {
            const res = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${financeiroToken}`)
                .send({ nome: 'Nova Categoria' });
            expect(res.status).toBe(403);
        });

        it('cria categoria com sucesso para ADMIN', async () => {
            const nome = `Categoria_${Date.now()}`;
            const res = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nome });

            expect(res.status).toBe(201);
            expect(res.body.nome).toBe(nome);
            expect(res.body.ativo).toBe(true);
        });

        it('retorna 400 com nome muito curto', async () => {
            const res = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nome: 'A' });
            expect(res.status).toBe(400);
        });

        it('retorna 400 sem nome', async () => {
            const res = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});
            expect(res.status).toBe(400);
        });
    });

    describe('PUT /categories/:id', () => {
        let categoriaId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nome: `EditTest_${Date.now()}` });
            categoriaId = res.body.id;
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).put(`/categories/${categoriaId}`).send({ nome: 'Novo Nome' });
            expect(res.status).toBe(401);
        });

        it('retorna 403 para COLABORADOR', async () => {
            const res = await request(app)
                .put(`/categories/${categoriaId}`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ nome: 'Novo Nome' });
            expect(res.status).toBe(403);
        });

        it('retorna 403 para FINANCEIRO', async () => {
            const res = await request(app)
                .put(`/categories/${categoriaId}`)
                .set('Authorization', `Bearer ${financeiroToken}`)
                .send({ nome: 'Novo Nome' });
            expect(res.status).toBe(403);
        });

        it('atualiza nome da categoria para ADMIN', async () => {
            const res = await request(app)
                .put(`/categories/${categoriaId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nome: `Atualizada_${Date.now()}` });

            expect(res.status).toBe(200);
        });

        it('desativa categoria para ADMIN', async () => {
            const res = await request(app)
                .put(`/categories/${categoriaId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ativo: false });

            expect(res.status).toBe(200);
            expect(res.body.ativo).toBe(false);
        });

        it('retorna 404 para categoria inexistente', async () => {
            const res = await request(app)
                .put('/categories/99999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nome: 'Inexistente' });

            expect(res.status).toBe(404);
        });
    });
});
