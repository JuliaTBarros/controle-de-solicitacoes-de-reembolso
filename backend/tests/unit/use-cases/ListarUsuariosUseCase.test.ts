import { ListarUsuariosUseCase } from '../../../src/application/use-cases/usuario/ListarUsuariosUseCase';
import { Usuario, Role } from '../../../src/domain/entities/Usuario';

const makeRepos = () => ({
    usuario: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), findByEmail: jest.fn(), update: jest.fn() },
});

const buildUsuario = (id: number, nome: string, perfil: Role = Role.COLABORADOR) =>
    new Usuario({
        id, nome, email: `${nome.toLowerCase()}@empresa.com`,
        senha: 'hash-secreto', perfil,
        criadoEm: new Date(), atualizadoEm: new Date(),
    });

describe('ListarUsuariosUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: ListarUsuariosUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new ListarUsuariosUseCase(repos.usuario);
    });

    it('retorna todos os usuários do repositório', async () => {
        const usuarios = [
            buildUsuario(1, 'Ana', Role.COLABORADOR),
            buildUsuario(2, 'Bruno', Role.GESTOR),
            buildUsuario(3, 'Carla', Role.FINANCEIRO),
        ];
        repos.usuario.findAll.mockResolvedValue(usuarios);

        const result = await useCase.execute();

        expect(result).toBe(usuarios);
        expect(result).toHaveLength(3);
    });

    it('retorna lista vazia quando não há usuários', async () => {
        repos.usuario.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('retorna usuários de todos os perfis (sem filtrar por perfil)', async () => {
        const usuarios = [
            buildUsuario(1, 'Ana', Role.COLABORADOR),
            buildUsuario(2, 'Bruno', Role.GESTOR),
            buildUsuario(3, 'Carla', Role.FINANCEIRO),
            buildUsuario(4, 'Diego', Role.ADMIN),
        ];
        repos.usuario.findAll.mockResolvedValue(usuarios);

        const result = await useCase.execute();

        expect(result).toHaveLength(4);
    });

    it('chama o repositório findAll sem argumentos', async () => {
        repos.usuario.findAll.mockResolvedValue([]);

        await useCase.execute();

        expect(repos.usuario.findAll).toHaveBeenCalledWith();
        expect(repos.usuario.findAll).toHaveBeenCalledTimes(1);
    });

    it('retorna exatamente o que o repositório retorna (sem transformação)', async () => {
        const usuarios = [buildUsuario(1, 'Ana')];
        repos.usuario.findAll.mockResolvedValue(usuarios);

        const result = await useCase.execute();

        expect(result).toBe(usuarios);
    });
});
