import { Anexo } from '../../../src/domain/entities/Anexo';
import { Categoria } from '../../../src/domain/entities/Categoria';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';
import { Usuario, Role } from '../../../src/domain/entities/Usuario';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';

// ─── Anexo ───────────────────────────────────────────────────────────────────

describe('Anexo', () => {
    const props = {
        id: 1,
        solicitacaoId: 10,
        nomeArquivo: 'nota.pdf',
        urlArquivo: 'https://storage/nota.pdf',
        tipoArquivo: 'application/pdf',
        criadoEm: new Date('2025-01-01'),
    };

    let anexo: Anexo;

    beforeEach(() => {
        anexo = new Anexo(props);
    });

    it('expõe id', () => expect(anexo.id).toBe(1));
    it('expõe solicitacaoId', () => expect(anexo.solicitacaoId).toBe(10));
    it('expõe nomeArquivo', () => expect(anexo.nomeArquivo).toBe('nota.pdf'));
    it('expõe urlArquivo', () => expect(anexo.urlArquivo).toBe('https://storage/nota.pdf'));
    it('expõe tipoArquivo', () => expect(anexo.tipoArquivo).toBe('application/pdf'));
    it('expõe criadoEm', () => expect(anexo.criadoEm).toEqual(new Date('2025-01-01')));
});

// ─── Categoria ───────────────────────────────────────────────────────────────

describe('Categoria', () => {
    const makeCategoria = (ativo: boolean) =>
        new Categoria({
            id: 5,
            nome: 'Alimentação',
            ativo,
            criadoEm: new Date('2025-01-01'),
            atualizadoEm: new Date('2025-01-02'),
        });

    it('expõe id', () => expect(makeCategoria(true).id).toBe(5));
    it('active retorna true quando ativo=true', () => expect(makeCategoria(true).active).toBe(true));
    it('active retorna false quando ativo=false', () => expect(makeCategoria(false).active).toBe(false));
    it('isActive() retorna true quando ativo=true', () => expect(makeCategoria(true).isActive()).toBe(true));
    it('isActive() retorna false quando ativo=false', () => expect(makeCategoria(false).isActive()).toBe(false));
});

// ─── SolicitacaoDeReembolso ───────────────────────────────────────────────────

describe('SolicitacaoDeReembolso', () => {
    const makeReembolso = (status: ReembolsoStatus) =>
        new SolicitacaoDeReembolso({
            id: 1,
            solicitanteId: 2,
            categoriaId: 3,
            descricao: 'Almoço com cliente',
            valor: 150,
            dataDespesa: new Date('2025-03-01'),
            status,
            criadoEm: new Date('2025-03-02'),
            atualizadoEm: new Date('2025-03-02'),
        });

    it('isDraft() verdadeiro para RASCUNHO', () =>
        expect(makeReembolso(ReembolsoStatus.RASCUNHO).isDraft()).toBe(true));
    it('isDraft() falso para outro status', () =>
        expect(makeReembolso(ReembolsoStatus.ENVIADO).isDraft()).toBe(false));

    it('isSubmitted() verdadeiro para ENVIADO', () =>
        expect(makeReembolso(ReembolsoStatus.ENVIADO).isSubmitted()).toBe(true));
    it('isSubmitted() falso para outro status', () =>
        expect(makeReembolso(ReembolsoStatus.RASCUNHO).isSubmitted()).toBe(false));

    it('isApproved() verdadeiro para APROVADO', () =>
        expect(makeReembolso(ReembolsoStatus.APROVADO).isApproved()).toBe(true));
    it('isApproved() falso para outro status', () =>
        expect(makeReembolso(ReembolsoStatus.ENVIADO).isApproved()).toBe(false));

    it('isRejected() verdadeiro para REJEITADO', () =>
        expect(makeReembolso(ReembolsoStatus.REJEITADO).isRejected()).toBe(true));
    it('isRejected() falso para outro status', () =>
        expect(makeReembolso(ReembolsoStatus.APROVADO).isRejected()).toBe(false));

    it('isPaid() verdadeiro para PAGO', () =>
        expect(makeReembolso(ReembolsoStatus.PAGO).isPaid()).toBe(true));
    it('isPaid() falso para outro status', () =>
        expect(makeReembolso(ReembolsoStatus.APROVADO).isPaid()).toBe(false));

    it('isCanceled() verdadeiro para CANCELADO', () =>
        expect(makeReembolso(ReembolsoStatus.CANCELADO).isCanceled()).toBe(true));
    it('isCanceled() falso para outro status', () =>
        expect(makeReembolso(ReembolsoStatus.RASCUNHO).isCanceled()).toBe(false));
});

// ─── Usuario ─────────────────────────────────────────────────────────────────

describe('Usuario', () => {
    const makeUsuario = (perfil: Role) =>
        new Usuario({
            id: 1,
            nome: 'Julia',
            email: 'julia@test.com',
            senha: 'hash',
            perfil,
            criadoEm: new Date('2025-01-01'),
            atualizadoEm: new Date('2025-01-01'),
        });

    it('role retorna o perfil', () =>
        expect(makeUsuario(Role.ADMIN).role).toBe(Role.ADMIN));

    it('isColaborador() verdadeiro para COLABORADOR', () =>
        expect(makeUsuario(Role.COLABORADOR).isColaborador()).toBe(true));
    it('isColaborador() falso para outros perfis', () =>
        expect(makeUsuario(Role.GESTOR).isColaborador()).toBe(false));

    it('isGestor() verdadeiro para GESTOR', () =>
        expect(makeUsuario(Role.GESTOR).isGestor()).toBe(true));
    it('isGestor() falso para outros perfis', () =>
        expect(makeUsuario(Role.ADMIN).isGestor()).toBe(false));

    it('isFinanceiro() verdadeiro para FINANCEIRO', () =>
        expect(makeUsuario(Role.FINANCEIRO).isFinanceiro()).toBe(true));
    it('isFinanceiro() falso para outros perfis', () =>
        expect(makeUsuario(Role.COLABORADOR).isFinanceiro()).toBe(false));

    it('isAdmin() verdadeiro para ADMIN', () =>
        expect(makeUsuario(Role.ADMIN).isAdmin()).toBe(true));
    it('isAdmin() falso para outros perfis', () =>
        expect(makeUsuario(Role.FINANCEIRO).isAdmin()).toBe(false));
});
