import { AtualizarCategoriaUseCase } from '../../../src/application/use-cases/categoria/AtualizarCategoriaUseCase';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { Categoria } from '../../../src/domain/entities/Categoria';

const makeRepos = () => ({
    categoria: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
});

const buildCategoria = (id: number, nome: string, ativo = true) =>
    new Categoria({ id, nome, ativo, criadoEm: new Date(), atualizadoEm: new Date() });

describe('AtualizarCategoriaUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: AtualizarCategoriaUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new AtualizarCategoriaUseCase(repos.categoria);
    });

    it('atualiza categoria existente com novo nome e retorna a entidade atualizada', async () => {
        const categoriaAtualizada = buildCategoria(1, 'Novo Nome');
        repos.categoria.findById.mockResolvedValue(buildCategoria(1, 'Nome Antigo'));
        repos.categoria.update.mockResolvedValue(categoriaAtualizada);

        const result = await useCase.execute(1, { nome: 'Novo Nome' });

        expect(result).toBe(categoriaAtualizada);
    });

    it('atualiza apenas o campo nome', async () => {
        repos.categoria.findById.mockResolvedValue(buildCategoria(1, 'Alimentação'));
        repos.categoria.update.mockResolvedValue(buildCategoria(1, 'Refeição'));

        await useCase.execute(1, { nome: 'Refeição' });

        expect(repos.categoria.update).toHaveBeenCalledWith(1, { nome: 'Refeição' });
    });

    it('atualiza apenas o campo ativo (desativando a categoria)', async () => {
        repos.categoria.findById.mockResolvedValue(buildCategoria(1, 'Alimentação', true));
        repos.categoria.update.mockResolvedValue(buildCategoria(1, 'Alimentação', false));

        await useCase.execute(1, { ativo: false });

        expect(repos.categoria.update).toHaveBeenCalledWith(1, { ativo: false });
    });

    it('atualiza apenas o campo ativo (reativando a categoria)', async () => {
        repos.categoria.findById.mockResolvedValue(buildCategoria(1, 'Alimentação', false));
        repos.categoria.update.mockResolvedValue(buildCategoria(1, 'Alimentação', true));

        await useCase.execute(1, { ativo: true });

        expect(repos.categoria.update).toHaveBeenCalledWith(1, { ativo: true });
    });

    it('atualiza nome e ativo simultaneamente', async () => {
        repos.categoria.findById.mockResolvedValue(buildCategoria(1, 'Alimentação', true));
        repos.categoria.update.mockResolvedValue(buildCategoria(1, 'Refeição', false));

        await useCase.execute(1, { nome: 'Refeição', ativo: false });

        expect(repos.categoria.update).toHaveBeenCalledWith(1, { nome: 'Refeição', ativo: false });
    });

    it('chama findById com o id correto antes de atualizar', async () => {
        repos.categoria.findById.mockResolvedValue(buildCategoria(7, 'Categoria'));
        repos.categoria.update.mockResolvedValue(buildCategoria(7, 'Nova'));

        await useCase.execute(7, { nome: 'Nova' });

        expect(repos.categoria.findById).toHaveBeenCalledWith(7);
    });

    it('lança NotFoundError se a categoria não existir', async () => {
        repos.categoria.findById.mockResolvedValue(null);

        await expect(useCase.execute(99, { nome: 'Inexistente' })).rejects.toThrow(NotFoundError);
    });

    it('não chama update se a categoria não existir', async () => {
        repos.categoria.findById.mockResolvedValue(null);

        await expect(useCase.execute(99, { nome: 'Inexistente' })).rejects.toThrow();

        expect(repos.categoria.update).not.toHaveBeenCalled();
    });

    it('chama update com payload vazio quando nenhum campo é fornecido', async () => {
        repos.categoria.findById.mockResolvedValue(buildCategoria(1, 'Alimentação'));
        repos.categoria.update.mockResolvedValue(buildCategoria(1, 'Alimentação'));

        await useCase.execute(1, {});

        expect(repos.categoria.update).toHaveBeenCalledWith(1, {});
    });
});
