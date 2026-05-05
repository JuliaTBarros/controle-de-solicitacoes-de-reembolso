import { LoginUseCase } from '../../../src/application/use-cases/auth/LoginUseCase';
import { Usuario, Role } from '../../../src/domain/entities/Usuario';

const makeUsuarioRepo = () => ({
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
});

const makeHashService = () => ({
    hash: jest.fn(),
    compare: jest.fn(),
});

const makeTokenService = () => ({
    sign: jest.fn().mockReturnValue('jwt.token.here'),
    verify: jest.fn(),
});

const usuarioMock = new Usuario({
    id: 1,
    nome: 'Colaborador',
    email: 'colaborador@test.com',
    senha: 'hashedpassword',
    perfil: Role.COLABORADOR,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
});

describe('LoginUseCase', () => {
    let usuarioRepo: ReturnType<typeof makeUsuarioRepo>;
    let hashService: ReturnType<typeof makeHashService>;
    let tokenService: ReturnType<typeof makeTokenService>;
    let useCase: LoginUseCase;

    beforeEach(() => {
        usuarioRepo = makeUsuarioRepo();
        hashService = makeHashService();
        tokenService = makeTokenService();
        useCase = new LoginUseCase(usuarioRepo, hashService, tokenService);
    });

    it('retorna token e dados do usuário com credenciais válidas', async () => {
        usuarioRepo.findByEmail.mockResolvedValue(usuarioMock);
        hashService.compare.mockResolvedValue(true);

        const result = await useCase.execute({ email: 'colaborador@test.com', senha: '123456' });

        expect(result.token).toBe('jwt.token.here');
        expect(result.user.email).toBe('colaborador@test.com');
        expect(result.user.perfil).toBe(Role.COLABORADOR);
    });

    it('lança DomainError 401 se usuário não existir', async () => {
        usuarioRepo.findByEmail.mockResolvedValue(null);

        await expect(useCase.execute({ email: 'nao@existe.com', senha: '123456' }))
            .rejects.toMatchObject({ statusCode: 401 });
    });

    it('lança DomainError 401 se senha estiver incorreta', async () => {
        usuarioRepo.findByEmail.mockResolvedValue(usuarioMock);
        hashService.compare.mockResolvedValue(false);

        await expect(useCase.execute({ email: 'colaborador@test.com', senha: 'errada' }))
            .rejects.toMatchObject({ statusCode: 401 });
    });

    it('não expõe a senha no retorno', async () => {
        usuarioRepo.findByEmail.mockResolvedValue(usuarioMock);
        hashService.compare.mockResolvedValue(true);

        const result = await useCase.execute({ email: 'colaborador@test.com', senha: '123456' });

        expect((result.user as any).senha).toBeUndefined();
    });
});
