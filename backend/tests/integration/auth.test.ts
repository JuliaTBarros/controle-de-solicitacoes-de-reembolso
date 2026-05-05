import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/login', () => {
    it('retorna 200, token e dados do usuário com credenciais válidas', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'colaborador@test.com', senha: '123456' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(typeof res.body.token).toBe('string');
        expect(res.body.user).toMatchObject({
            email: 'colaborador@test.com',
            perfil: 'COLABORADOR',
        });
        expect(res.body.user.senha).toBeUndefined();
    });

    it('retorna 200 para gestor', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'gestor@test.com', senha: '123456' });

        expect(res.status).toBe(200);
        expect(res.body.user.perfil).toBe('GESTOR');
    });

    it('retorna 401 com senha incorreta', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'colaborador@test.com', senha: 'senhaerrada' });

        expect(res.status).toBe(401);
    });

    it('retorna 401 com e-mail inexistente', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'naoexiste@test.com', senha: '123456' });

        expect(res.status).toBe(401);
    });

    it('retorna 400 com e-mail em formato inválido', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'emailsemdominio', senha: '123456' });

        expect(res.status).toBe(400);
    });

    it('retorna 400 com senha muito curta', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'colaborador@test.com', senha: '123' });

        expect(res.status).toBe(400);
    });

    it('retorna 400 sem body', async () => {
        const res = await request(app).post('/auth/login').send({});
        expect(res.status).toBe(400);
    });
});

describe('Middleware de autenticação', () => {
    it('retorna 401 com token malformado', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', 'Bearer token.invalido.aqui');
        expect(res.status).toBe(401);
    });

    it('retorna 401 sem prefixo Bearer', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', 'tokendiretosemprefixo');
        expect(res.status).toBe(401);
    });

    it('retorna 401 com header Authorization vazio', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', '');
        expect(res.status).toBe(401);
    });
});
