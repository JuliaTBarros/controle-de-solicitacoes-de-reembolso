import request from 'supertest';
import app from '../../src/app';
import {
    getColaboradorToken,
    getColaborador2Token,
    getGestorToken,
    getFinanceiroToken,
    getAdminToken,
} from '../helpers/tokens';

describe('Reimbursements API', () => {
    let colaboradorToken: string;
    let colaborador2Token: string;
    let gestorToken: string;
    let financeiroToken: string;
    let adminToken: string;
    let categoriaId: number;

    beforeAll(async () => {
        [colaboradorToken, colaborador2Token, gestorToken, financeiroToken, adminToken] = await Promise.all([
            getColaboradorToken(),
            getColaborador2Token(),
            getGestorToken(),
            getFinanceiroToken(),
            getAdminToken(),
        ]);

        const catRes = await request(app)
            .get('/categories')
            .set('Authorization', `Bearer ${colaboradorToken}`);
        categoriaId = catRes.body[0].id;
    });

    // ─── POST /reimbursements ──────────────────────────────────────────────────

    describe('POST /reimbursements', () => {
        it('retorna 401 sem token', async () => {
            const res = await request(app).post('/reimbursements').send({});
            expect(res.status).toBe(401);
        });

        it('retorna 403 para GESTOR', async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${gestorToken}`)
                .send({ categoriaId, descricao: 'Teste gestor', valor: 100, dataDespesa: new Date().toISOString() });
            expect(res.status).toBe(403);
        });

        it('retorna 403 para FINANCEIRO', async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${financeiroToken}`)
                .send({ categoriaId, descricao: 'Teste financeiro', valor: 100, dataDespesa: new Date().toISOString() });
            expect(res.status).toBe(403);
        });

        it('retorna 400 com valor zero', async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa válida', valor: 0, dataDespesa: new Date().toISOString() });
            expect(res.status).toBe(400);
        });

        it('retorna 400 com valor negativo', async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa válida', valor: -10, dataDespesa: new Date().toISOString() });
            expect(res.status).toBe(400);
        });

        it('retorna 400 com descrição muito curta', async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'abc', valor: 100, dataDespesa: new Date().toISOString() });
            expect(res.status).toBe(400);
        });

        it('retorna 400 sem dataDespesa', async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa válida', valor: 100 });
            expect(res.status).toBe(400);
        });

        it('retorna 400 com categoria inativa', async () => {
            const catRes = await request(app)
                .post('/categories')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nome: `Inativa_${Date.now()}` });
            const inativaCatId = catRes.body.id;

            await request(app)
                .put(`/categories/${inativaCatId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ativo: false });

            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId: inativaCatId, descricao: 'Despesa válida', valor: 100, dataDespesa: new Date().toISOString() });

            expect(res.status).toBe(400);
        });

        it('cria reembolso com sucesso em status RASCUNHO', async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa de alimentação', valor: 150.75, dataDespesa: new Date().toISOString() });

            expect(res.status).toBe(201);
            expect(res.body.id).toBeDefined();
            expect(res.body.status).toBe('RASCUNHO');
        });
    });

    // ─── GET /reimbursements ───────────────────────────────────────────────────

    describe('GET /reimbursements', () => {
        it('retorna 401 sem token', async () => {
            const res = await request(app).get('/reimbursements');
            expect(res.status).toBe(401);
        });

        it('retorna lista para colaborador autenticado', async () => {
            const res = await request(app)
                .get('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('retorna lista para gestor', async () => {
            const res = await request(app)
                .get('/reimbursements')
                .set('Authorization', `Bearer ${gestorToken}`);

            expect(res.status).toBe(200);
        });

        it('COLABORADOR não vê solicitações de outro colaborador', async () => {
            const r = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaborador2Token}`)
                .send({ categoriaId, descricao: 'Despesa exclusiva colaborador2', valor: 99, dataDespesa: new Date().toISOString() });
            const colaborador2ReimbId = r.body.id;

            const res = await request(app)
                .get('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`);

            const ids = res.body.map((item: any) => item.id);
            expect(ids).not.toContain(colaborador2ReimbId);
        });

        it('GESTOR vê solicitações enviadas de todos os colaboradores', async () => {
            const r1 = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa visível ao gestor col1', valor: 55, dataDespesa: new Date().toISOString() });

            const r2 = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaborador2Token}`)
                .send({ categoriaId, descricao: 'Despesa visível ao gestor col2', valor: 66, dataDespesa: new Date().toISOString() });

            // GESTOR filtra por status ENVIADO — precisa submeter antes
            await request(app).post(`/reimbursements/${r1.body.id}/submit`).set('Authorization', `Bearer ${colaboradorToken}`);
            await request(app).post(`/reimbursements/${r2.body.id}/submit`).set('Authorization', `Bearer ${colaborador2Token}`);

            const res = await request(app)
                .get('/reimbursements')
                .set('Authorization', `Bearer ${gestorToken}`);

            const ids = res.body.map((item: any) => item.id);
            expect(ids).toContain(r1.body.id);
            expect(ids).toContain(r2.body.id);
        });
    });

    // ─── GET /reimbursements/:id ───────────────────────────────────────────────

    describe('GET /reimbursements/:id', () => {
        let reimbursementId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para busca', valor: 50, dataDespesa: new Date().toISOString() });
            reimbursementId = res.body.id;

            // GESTOR só visualiza status ENVIADO ou posterior — precisa submeter antes
            await request(app)
                .post(`/reimbursements/${reimbursementId}/submit`)
                .set('Authorization', `Bearer ${colaboradorToken}`);
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).get(`/reimbursements/${reimbursementId}`);
            expect(res.status).toBe(401);
        });

        it('retorna 404 para id inexistente', async () => {
            const res = await request(app)
                .get('/reimbursements/99999')
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(404);
        });

        it('retorna reembolso existente', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}`)
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(reimbursementId);
        });

        it('retorna 403 quando COLABORADOR tenta ver reembolso de outro', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}`)
                .set('Authorization', `Bearer ${colaborador2Token}`);
            expect(res.status).toBe(403);
        });

        it('GESTOR pode ver reembolso de qualquer colaborador', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}`)
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(reimbursementId);
        });

        it('ADMIN pode ver reembolso de qualquer colaborador', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(reimbursementId);
        });
    });

    // ─── PUT /reimbursements/:id ───────────────────────────────────────────────

    describe('PUT /reimbursements/:id', () => {
        let reimbursementId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para edição', valor: 80, dataDespesa: new Date().toISOString() });
            reimbursementId = res.body.id;
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).put(`/reimbursements/${reimbursementId}`).send({ valor: 90 });
            expect(res.status).toBe(401);
        });

        it('retorna 403 para outro colaborador', async () => {
            const res = await request(app)
                .put(`/reimbursements/${reimbursementId}`)
                .set('Authorization', `Bearer ${colaborador2Token}`)
                .send({ valor: 90 });
            expect(res.status).toBe(403);
        });

        it('retorna 403 para GESTOR', async () => {
            const res = await request(app)
                .put(`/reimbursements/${reimbursementId}`)
                .set('Authorization', `Bearer ${gestorToken}`)
                .send({ valor: 90 });
            expect(res.status).toBe(403);
        });

        it('retorna 403 para FINANCEIRO', async () => {
            const res = await request(app)
                .put(`/reimbursements/${reimbursementId}`)
                .set('Authorization', `Bearer ${financeiroToken}`)
                .send({ valor: 90 });
            expect(res.status).toBe(403);
        });

        it('edita reembolso em RASCUNHO com sucesso', async () => {
            const res = await request(app)
                .put(`/reimbursements/${reimbursementId}`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ valor: 120, descricao: 'Despesa atualizada' });

            expect(res.status).toBe(200);
        });

        it('retorna 404 para id inexistente', async () => {
            const res = await request(app)
                .put('/reimbursements/99999')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ valor: 90 });
            expect(res.status).toBe(404);
        });
    });

    // ─── POST /reimbursements/:id/submit ──────────────────────────────────────

    describe('POST /reimbursements/:id/submit', () => {
        let reimbursementId: number;

        beforeAll(async () => {
            const res = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para envio', valor: 200, dataDespesa: new Date().toISOString() });
            reimbursementId = res.body.id;
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).post(`/reimbursements/${reimbursementId}/submit`);
            expect(res.status).toBe(401);
        });

        it('retorna 403 para GESTOR', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/submit`)
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna 403 para outro colaborador', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/submit`)
                .set('Authorization', `Bearer ${colaborador2Token}`);
            expect(res.status).toBe(403);
        });

        it('envia reembolso RASCUNHO com sucesso', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/submit`)
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(200);
        });

        it('retorna 400 ao tentar enviar novamente (já ENVIADO)', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/submit`)
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(400);
        });

        it('retorna 404 para id inexistente', async () => {
            const res = await request(app)
                .post('/reimbursements/99999/submit')
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(404);
        });
    });

    // ─── POST /reimbursements/:id/approve ─────────────────────────────────────

    describe('POST /reimbursements/:id/approve', () => {
        let rascunhoId: number;
        let enviadoId: number;

        beforeAll(async () => {
            const r1 = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para aprovação', valor: 300, dataDespesa: new Date().toISOString() });
            rascunhoId = r1.body.id;

            const r2 = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para aprovação 2', valor: 300, dataDespesa: new Date().toISOString() });
            enviadoId = r2.body.id;

            await request(app)
                .post(`/reimbursements/${enviadoId}/submit`)
                .set('Authorization', `Bearer ${colaboradorToken}`);
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).post(`/reimbursements/${enviadoId}/approve`);
            expect(res.status).toBe(401);
        });

        it('retorna 403 para COLABORADOR', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/approve`)
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna 403 para FINANCEIRO', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/approve`)
                .set('Authorization', `Bearer ${financeiroToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna 400 ao tentar aprovar RASCUNHO', async () => {
            const res = await request(app)
                .post(`/reimbursements/${rascunhoId}/approve`)
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(400);
        });

        it('aprova reembolso ENVIADO com sucesso', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/approve`)
                .set('Authorization', `Bearer ${gestorToken}`);

            expect(res.status).toBe(200);
        });

        it('retorna 400 ao tentar aprovar reembolso já APROVADO', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/approve`)
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(400);
        });

        it('retorna 404 para id inexistente', async () => {
            const res = await request(app)
                .post('/reimbursements/99999/approve')
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(404);
        });
    });

    // ─── POST /reimbursements/:id/reject ──────────────────────────────────────

    describe('POST /reimbursements/:id/reject', () => {
        let enviadoId: number;

        beforeAll(async () => {
            const r = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para rejeição', valor: 250, dataDespesa: new Date().toISOString() });
            enviadoId = r.body.id;

            await request(app)
                .post(`/reimbursements/${enviadoId}/submit`)
                .set('Authorization', `Bearer ${colaboradorToken}`);
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/reject`)
                .send({ justificativaRejeicao: 'Motivo' });
            expect(res.status).toBe(401);
        });

        it('retorna 403 para COLABORADOR', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/reject`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ justificativaRejeicao: 'Motivo' });
            expect(res.status).toBe(403);
        });

        it('retorna 403 para FINANCEIRO', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/reject`)
                .set('Authorization', `Bearer ${financeiroToken}`)
                .send({ justificativaRejeicao: 'Motivo' });
            expect(res.status).toBe(403);
        });

        it('retorna 400 sem justificativa', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/reject`)
                .set('Authorization', `Bearer ${gestorToken}`)
                .send({});
            expect(res.status).toBe(400);
        });

        it('rejeita reembolso ENVIADO com justificativa', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/reject`)
                .set('Authorization', `Bearer ${gestorToken}`)
                .send({ justificativaRejeicao: 'Documentação incompleta.' });

            expect(res.status).toBe(200);
        });

        it('retorna 400 ao tentar rejeitar novamente (já REJEITADO)', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/reject`)
                .set('Authorization', `Bearer ${gestorToken}`)
                .send({ justificativaRejeicao: 'Nova justificativa.' });
            expect(res.status).toBe(400);
        });

        it('retorna 404 para id inexistente', async () => {
            const res = await request(app)
                .post('/reimbursements/99999/reject')
                .set('Authorization', `Bearer ${gestorToken}`)
                .send({ justificativaRejeicao: 'Motivo' });
            expect(res.status).toBe(404);
        });
    });

    // ─── POST /reimbursements/:id/pay ─────────────────────────────────────────

    describe('POST /reimbursements/:id/pay', () => {
        let aprovadoId: number;
        let enviadoId: number;

        beforeAll(async () => {
            const r1 = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para pagamento', valor: 500, dataDespesa: new Date().toISOString() });
            aprovadoId = r1.body.id;

            const r2 = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa enviada somente', valor: 500, dataDespesa: new Date().toISOString() });
            enviadoId = r2.body.id;

            await request(app).post(`/reimbursements/${aprovadoId}/submit`).set('Authorization', `Bearer ${colaboradorToken}`);
            await request(app).post(`/reimbursements/${aprovadoId}/approve`).set('Authorization', `Bearer ${gestorToken}`);

            await request(app).post(`/reimbursements/${enviadoId}/submit`).set('Authorization', `Bearer ${colaboradorToken}`);
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).post(`/reimbursements/${aprovadoId}/pay`);
            expect(res.status).toBe(401);
        });

        it('retorna 403 para COLABORADOR', async () => {
            const res = await request(app)
                .post(`/reimbursements/${aprovadoId}/pay`)
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna 403 para GESTOR', async () => {
            const res = await request(app)
                .post(`/reimbursements/${aprovadoId}/pay`)
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna 400 ao tentar pagar reembolso ENVIADO (sem aprovação)', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/pay`)
                .set('Authorization', `Bearer ${financeiroToken}`);
            expect(res.status).toBe(400);
        });

        it('paga reembolso APROVADO com sucesso', async () => {
            const res = await request(app)
                .post(`/reimbursements/${aprovadoId}/pay`)
                .set('Authorization', `Bearer ${financeiroToken}`);

            expect(res.status).toBe(200);
        });

        it('retorna 400 ao tentar pagar reembolso já PAGO', async () => {
            const res = await request(app)
                .post(`/reimbursements/${aprovadoId}/pay`)
                .set('Authorization', `Bearer ${financeiroToken}`);
            expect(res.status).toBe(400);
        });

        it('retorna 404 para id inexistente', async () => {
            const res = await request(app)
                .post('/reimbursements/99999/pay')
                .set('Authorization', `Bearer ${financeiroToken}`);
            expect(res.status).toBe(404);
        });
    });

    // ─── POST /reimbursements/:id/cancel ──────────────────────────────────────

    describe('POST /reimbursements/:id/cancel', () => {
        let rascunhoId: number;
        let enviadoId: number;

        beforeAll(async () => {
            const r1 = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para cancelar RASCUNHO', valor: 100, dataDespesa: new Date().toISOString() });
            rascunhoId = r1.body.id;

            const r2 = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para cancelar ENVIADO', valor: 100, dataDespesa: new Date().toISOString() });
            enviadoId = r2.body.id;

            await request(app).post(`/reimbursements/${enviadoId}/submit`).set('Authorization', `Bearer ${colaboradorToken}`);
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).post(`/reimbursements/${rascunhoId}/cancel`);
            expect(res.status).toBe(401);
        });

        it('retorna 403 para GESTOR', async () => {
            const res = await request(app)
                .post(`/reimbursements/${rascunhoId}/cancel`)
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(403);
        });

        it('retorna 403 para outro colaborador', async () => {
            const res = await request(app)
                .post(`/reimbursements/${rascunhoId}/cancel`)
                .set('Authorization', `Bearer ${colaborador2Token}`);
            expect(res.status).toBe(403);
        });

        it('retorna 403 para FINANCEIRO', async () => {
            const res = await request(app)
                .post(`/reimbursements/${rascunhoId}/cancel`)
                .set('Authorization', `Bearer ${financeiroToken}`);
            expect(res.status).toBe(403);
        });

        it('cancela reembolso RASCUNHO com sucesso', async () => {
            const res = await request(app)
                .post(`/reimbursements/${rascunhoId}/cancel`)
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(200);
        });

        it('retorna 400 ao tentar cancelar novamente (já CANCELADO)', async () => {
            const res = await request(app)
                .post(`/reimbursements/${rascunhoId}/cancel`)
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(400);
        });

        it('cancela reembolso ENVIADO com sucesso', async () => {
            const res = await request(app)
                .post(`/reimbursements/${enviadoId}/cancel`)
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(200);
        });

        it('retorna 404 para id inexistente', async () => {
            const res = await request(app)
                .post('/reimbursements/99999/cancel')
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(404);
        });
    });

    // ─── Editar reembolso não-RASCUNHO ────────────────────────────────────────

    describe('PUT /reimbursements/:id (status não RASCUNHO)', () => {
        let enviadoId: number;

        beforeAll(async () => {
            const r = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa já enviada', valor: 100, dataDespesa: new Date().toISOString() });
            enviadoId = r.body.id;

            await request(app).post(`/reimbursements/${enviadoId}/submit`).set('Authorization', `Bearer ${colaboradorToken}`);
        });

        it('retorna 400 ao tentar editar reembolso ENVIADO', async () => {
            const res = await request(app)
                .put(`/reimbursements/${enviadoId}`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ descricao: 'Tentativa de edição' });

            expect(res.status).toBe(400);
        });
    });

    // ─── GET /reimbursements/:id/history ──────────────────────────────────────

    describe('GET /reimbursements/:id/history', () => {
        let reimbursementId: number;

        beforeAll(async () => {
            const r = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa para histórico', valor: 100, dataDespesa: new Date().toISOString() });
            reimbursementId = r.body.id;

            await request(app).post(`/reimbursements/${reimbursementId}/submit`).set('Authorization', `Bearer ${colaboradorToken}`);
            await request(app).post(`/reimbursements/${reimbursementId}/approve`).set('Authorization', `Bearer ${gestorToken}`);
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).get(`/reimbursements/${reimbursementId}/history`);
            expect(res.status).toBe(401);
        });

        it('retorna histórico com as ações registradas', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}/history`)
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(3);

            const acoes = res.body.map((h: any) => h.acao);
            expect(acoes).toContain('CREATED');
            expect(acoes).toContain('SUBMITTED');
            expect(acoes).toContain('APPROVED');
        });

        it('gestor pode ver histórico', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}/history`)
                .set('Authorization', `Bearer ${gestorToken}`);
            expect(res.status).toBe(200);
        });

        it('financeiro pode ver histórico', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}/history`)
                .set('Authorization', `Bearer ${financeiroToken}`);
            expect(res.status).toBe(200);
        });

        it('retorna 403 para outro colaborador ver histórico alheio', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}/history`)
                .set('Authorization', `Bearer ${colaborador2Token}`);
            expect(res.status).toBe(403);
        });

        it('retorna 404 para id inexistente', async () => {
            const res = await request(app)
                .get('/reimbursements/99999/history')
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(404);
        });
    });

    // ─── POST /reimbursements/:id/attachments ─────────────────────────────────

    describe('POST /reimbursements/:id/attachments', () => {
        let reimbursementId: number;

        beforeAll(async () => {
            const r = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa com anexo', valor: 100, dataDespesa: new Date().toISOString() });
            reimbursementId = r.body.id;
        });

        const validAttachment = {
            nomeArquivo: 'nota.pdf',
            urlArquivo: 'https://storage.example.com/nota.pdf',
            tipoArquivo: 'PDF',
        };

        it('retorna 401 sem token', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/attachments`)
                .send(validAttachment);
            expect(res.status).toBe(401);
        });

        it('retorna 403 para GESTOR', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${gestorToken}`)
                .send(validAttachment);
            expect(res.status).toBe(403);
        });

        it('retorna 403 para outro colaborador', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${colaborador2Token}`)
                .send(validAttachment);
            expect(res.status).toBe(403);
        });

        it('retorna 400 para tipo de arquivo inválido', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ ...validAttachment, tipoArquivo: 'DOCX' });
            expect(res.status).toBe(400);
        });

        it('cria anexo PDF com sucesso', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send(validAttachment);

            expect(res.status).toBe(201);
            expect(res.body.tipoArquivo).toBe('PDF');
        });

        it('cria anexo JPG com sucesso', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ nomeArquivo: 'foto.jpg', urlArquivo: 'https://storage.example.com/foto.jpg', tipoArquivo: 'JPG' });

            expect(res.status).toBe(201);
        });

        it('cria anexo PNG com sucesso', async () => {
            const res = await request(app)
                .post(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ nomeArquivo: 'comprovante.png', urlArquivo: 'https://storage.example.com/comprovante.png', tipoArquivo: 'PNG' });

            expect(res.status).toBe(201);
        });

        it('retorna 404 para solicitação inexistente', async () => {
            const res = await request(app)
                .post('/reimbursements/99999/attachments')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send(validAttachment);
            expect(res.status).toBe(404);
        });
    });

    // ─── GET /reimbursements/:id/attachments ──────────────────────────────────

    describe('GET /reimbursements/:id/attachments', () => {
        let reimbursementId: number;

        beforeAll(async () => {
            const r = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ categoriaId, descricao: 'Despesa com lista de anexos', valor: 100, dataDespesa: new Date().toISOString() });
            reimbursementId = r.body.id;

            await request(app)
                .post(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${colaboradorToken}`)
                .send({ nomeArquivo: 'doc.pdf', urlArquivo: 'https://example.com/doc.pdf', tipoArquivo: 'PDF' });
        });

        it('retorna 401 sem token', async () => {
            const res = await request(app).get(`/reimbursements/${reimbursementId}/attachments`);
            expect(res.status).toBe(401);
        });

        it('retorna lista de anexos para o dono', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${colaboradorToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('retorna 403 para outro colaborador', async () => {
            const res = await request(app)
                .get(`/reimbursements/${reimbursementId}/attachments`)
                .set('Authorization', `Bearer ${colaborador2Token}`);
            expect(res.status).toBe(403);
        });

        it('retorna 404 para solicitação inexistente', async () => {
            const res = await request(app)
                .get('/reimbursements/99999/attachments')
                .set('Authorization', `Bearer ${colaboradorToken}`);
            expect(res.status).toBe(404);
        });
    });
});
