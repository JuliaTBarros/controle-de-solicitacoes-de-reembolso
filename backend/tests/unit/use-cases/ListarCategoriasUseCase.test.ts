import { ListarCategoriasUseCase } from '../../../src/application/use-cases/categoria/ListarCategoriasUseCase';
import { Categoria } from '../../../src/domain/entities/Categoria';

const makeRepos = () => ({
    categoria: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
});

const buildCategoria = (id: number, nome: string, ativo = true) =>
    new Categoria({ id, nome, ativo, criadoEm: new Date(), atualizadoEm: new Date() });

describe('ListarCategoriasUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: ListarCategoriasUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new ListarCategoriasUseCase(repos.categoria);
    });

    it('retorna todas as categorias do repositório', async () => {
        const categorias = [
            buildCategoria(1, 'Alimentação'),
            buildCategoria(2, 'Transporte'),
            buildCategoria(3, 'Hospedagem'),
        ];
        repos.categoria.findAll.mockResolvedValue(categorias);

        const result = await useCase.execute();

        expect(result).toBe(categorias);
        expect(result).toHaveLength(3);
    });

    it('retorna lista vazia quando não há categorias', async () => {
        repos.categoria.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('retorna categorias ativas e inativas (sem filtrar)', async () => {
        const categorias = [
            buildCategoria(1, 'Alimentação', true),
            buildCategoria(2, 'Descontinuada', false),
        ];
        repos.categoria.findAll.mockResolvedValue(categorias);

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
    });

    it('chama o repositório findAll sem argumentos', async () => {
        repos.categoria.findAll.mockResolvedValue([]);

        await useCase.execute();

        expect(repos.categoria.findAll).toHaveBeenCalledWith();
        expect(repos.categoria.findAll).toHaveBeenCalledTimes(1);
    });

    it('retorna exatamente o que o repositório retorna (sem transformação)', async () => {
        const categorias = [buildCategoria(1, 'Alimentação')];
        repos.categoria.findAll.mockResolvedValue(categorias);

        const result = await useCase.execute();

        expect(result).toBe(categorias);
    });
});
