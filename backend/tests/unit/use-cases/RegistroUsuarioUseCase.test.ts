import { RegistroUsuarioUseCase } from '../../../src/application/use-cases/auth/RegistroUsuarioUseCase';
import { Usuario, Role } from '../../../src/domain/entities/Usuario';

const makeUsuarioRepo = () => ({
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
});

const makeHashService = () => ({
    hash: jest.fn().mockResolvedValue('hashedpassword'),
    compare: jest.fn(),
});

const usuarioCriado = new Usuario({
    id: 1,
    nome: 'Novo Usuário',
    email: 'novo@test.com',
    senha: 'hashedpassword',
    perfil: Role.COLABORADOR,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
});

describe('RegistroUsuarioUseCase', () => {
    let usuarioRepo: ReturnType<typeof makeUsuarioRepo>;
    let hashService: ReturnType<typeof makeHashService>;
    let useCase: RegistroUsuarioUseCase;

    beforeEach(() => {
        usuarioRepo = makeUsuarioRepo();
        hashService = makeHashService();
        useCase = new RegistroUsuarioUseCase(usuarioRepo, hashService);
    });

    it('registra usuário com sucesso com perfil padrão COLABORADOR', async () => {
        usuarioRepo.findByEmail.mockResolvedValue(null);
        usuarioRepo.create.mockResolvedValue(usuarioCriado);

        const result = await useCase.execute({ nome: 'Novo Usuário', email: 'novo@test.com', senha: '123456' });

        expect(result.email).toBe('novo@test.com');
        expect(result.perfil).toBe(Role.COLABORADOR);
        expect(hashService.hash).toHaveBeenCalledWith('123456');
    });

    it('registra usuário com perfil explícito', async () => {
        const gestorCriado = new Usuario({ ...usuarioCriado.props, perfil: Role.GESTOR });
        usuarioRepo.findByEmail.mockResolvedValue(null);
        usuarioRepo.create.mockResolvedValue(gestorCriado);

        const result = await useCase.execute({ nome: 'Gestor', email: 'gestor@test.com', senha: '123456', perfil: 'GESTOR' });

        expect(result.perfil).toBe(Role.GESTOR);
    });

    it('lança DomainError 409 se e-mail já estiver cadastrado', async () => {
        usuarioRepo.findByEmail.mockResolvedValue(usuarioCriado);

        await expect(useCase.execute({ nome: 'Novo', email: 'novo@test.com', senha: '123456' }))
            .rejects.toMatchObject({ statusCode: 409 });
    });

    it('nunca salva senha em texto puro', async () => {
        usuarioRepo.findByEmail.mockResolvedValue(null);
        usuarioRepo.create.mockResolvedValue(usuarioCriado);

        await useCase.execute({ nome: 'Novo', email: 'novo@test.com', senha: 'minhasenha' });

        const createCall = usuarioRepo.create.mock.calls[0][0];
        expect(createCall.senha).not.toBe('minhasenha');
        expect(createCall.senha).toBe('hashedpassword');
    });
});
