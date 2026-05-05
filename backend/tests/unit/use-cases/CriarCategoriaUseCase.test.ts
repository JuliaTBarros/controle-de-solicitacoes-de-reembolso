import { CriarCategoriaUseCase } from '../../../src/application/use-cases/categoria/CriarCategoriaUseCase';
import { Categoria } from '../../../src/domain/entities/Categoria';

const makeRepos = () => ({
    categoria: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
});

const buildCategoria = (nome: string) =>
    new Categoria({ id: 1, nome, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() });

describe('CriarCategoriaUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: CriarCategoriaUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new CriarCategoriaUseCase(repos.categoria);
    });

    it('cria categoria com sucesso e retorna a entidade criada', async () => {
        const categoria = buildCategoria('Alimentação');
        repos.categoria.create.mockResolvedValue(categoria);

        const result = await useCase.execute('Alimentação');

        expect(result).toBe(categoria);
    });

    it('aplica trim no nome antes de criar', async () => {
        repos.categoria.create.mockResolvedValue(buildCategoria('Transporte'));

        await useCase.execute('  Transporte  ');

        expect(repos.categoria.create).toHaveBeenCalledWith({ nome: 'Transporte' });
    });

    it('aplica trim em espaços apenas à esquerda', async () => {
        repos.categoria.create.mockResolvedValue(buildCategoria('Hospedagem'));

        await useCase.execute('   Hospedagem');

        expect(repos.categoria.create).toHaveBeenCalledWith({ nome: 'Hospedagem' });
    });

    it('aplica trim em espaços apenas à direita', async () => {
        repos.categoria.create.mockResolvedValue(buildCategoria('Alimentação'));

        await useCase.execute('Alimentação   ');

        expect(repos.categoria.create).toHaveBeenCalledWith({ nome: 'Alimentação' });
    });

    it('passa o nome exato quando não há espaços extras', async () => {
        repos.categoria.create.mockResolvedValue(buildCategoria('Saúde'));

        await useCase.execute('Saúde');

        expect(repos.categoria.create).toHaveBeenCalledWith({ nome: 'Saúde' });
    });

    it('chama o repositório de criação exatamente uma vez', async () => {
        repos.categoria.create.mockResolvedValue(buildCategoria('Educação'));

        await useCase.execute('Educação');

        expect(repos.categoria.create).toHaveBeenCalledTimes(1);
    });
});
