import { CriarAnexoUseCase } from '../../../src/application/use-cases/reembolso/CriarAnexoUseCase';
import { DomainError } from '../../../src/domain/errors/DomainError';
import { NotFoundError } from '../../../src/domain/errors/NotFoundError';
import { UnauthorizedError } from '../../../src/domain/errors/UnauthorizedError';
import { ReembolsoStatus } from '../../../src/domain/value-objects/ReembolsoStatus';
import { SolicitacaoDeReembolso } from '../../../src/domain/entities/SolicitacaoDeReembolso';

const makeRepos = () => ({
    reembolso: { create: jest.fn(), findById: jest.fn(), findAll: jest.fn(), update: jest.fn() },
    anexo: { create: jest.fn(), findBySolicitacaoId: jest.fn(), findById: jest.fn(), delete: jest.fn() },
});

const reembolsoMock = new SolicitacaoDeReembolso({
    id: 1, solicitanteId: 1, categoriaId: 1, descricao: 'Despesa',
    valor: 100, dataDespesa: new Date(), status: ReembolsoStatus.RASCUNHO,
    criadoEm: new Date(), atualizadoEm: new Date(),
});

const validInput = {
    solicitacaoId: 1,
    solicitanteId: 1,
    nomeArquivo: 'nota.pdf',
    urlArquivo: 'https://storage.example.com/nota.pdf',
    tipoArquivo: 'PDF',
};

describe('CriarAnexoUseCase', () => {
    let repos: ReturnType<typeof makeRepos>;
    let useCase: CriarAnexoUseCase;

    beforeEach(() => {
        repos = makeRepos();
        useCase = new CriarAnexoUseCase(repos.reembolso, repos.anexo);
    });

    it('cria anexo PDF com sucesso', async () => {
        repos.reembolso.findById.mockResolvedValue(reembolsoMock);
        repos.anexo.create.mockResolvedValue({ id: 1, ...validInput });

        await useCase.execute(validInput);
        expect(repos.anexo.create).toHaveBeenCalledWith(
            expect.objectContaining({ tipoArquivo: 'PDF' })
        );
    });

    it('cria anexo JPG com sucesso', async () => {
        repos.reembolso.findById.mockResolvedValue(reembolsoMock);
        repos.anexo.create.mockResolvedValue({});

        await expect(useCase.execute({ ...validInput, tipoArquivo: 'JPG' })).resolves.not.toThrow();
    });

    it('cria anexo PNG com sucesso', async () => {
        repos.reembolso.findById.mockResolvedValue(reembolsoMock);
        repos.anexo.create.mockResolvedValue({});

        await expect(useCase.execute({ ...validInput, tipoArquivo: 'PNG' })).resolves.not.toThrow();
    });

    it('normaliza tipo de arquivo para maiúsculas', async () => {
        repos.reembolso.findById.mockResolvedValue(reembolsoMock);
        repos.anexo.create.mockResolvedValue({});

        await useCase.execute({ ...validInput, tipoArquivo: 'pdf' });

        expect(repos.anexo.create).toHaveBeenCalledWith(
            expect.objectContaining({ tipoArquivo: 'PDF' })
        );
    });

    it('lança NotFoundError se solicitação não existir', async () => {
        repos.reembolso.findById.mockResolvedValue(null);
        await expect(useCase.execute(validInput)).rejects.toThrow(NotFoundError);
    });

    it('lança UnauthorizedError se não for o dono', async () => {
        repos.reembolso.findById.mockResolvedValue(reembolsoMock);
        await expect(useCase.execute({ ...validInput, solicitanteId: 99 })).rejects.toThrow(UnauthorizedError);
    });

    it('lança DomainError se status não for RASCUNHO', async () => {
        const enviado = new SolicitacaoDeReembolso({
            id: 1, solicitanteId: 1, categoriaId: 1, descricao: 'Despesa',
            valor: 100, dataDespesa: new Date(), status: ReembolsoStatus.ENVIADO,
            criadoEm: new Date(), atualizadoEm: new Date(),
        });
        repos.reembolso.findById.mockResolvedValue(enviado);
        await expect(useCase.execute(validInput)).rejects.toThrow(DomainError);
    });

    it('não cria anexo em solicitação APROVADA', async () => {
        const aprovado = new SolicitacaoDeReembolso({
            id: 1, solicitanteId: 1, categoriaId: 1, descricao: 'Despesa',
            valor: 100, dataDespesa: new Date(), status: ReembolsoStatus.APROVADO,
            criadoEm: new Date(), atualizadoEm: new Date(),
        });
        repos.reembolso.findById.mockResolvedValue(aprovado);
        await expect(useCase.execute(validInput)).rejects.toThrow(DomainError);
        expect(repos.anexo.create).not.toHaveBeenCalled();
    });

    it('lança DomainError para tipo de arquivo inválido', async () => {
        repos.reembolso.findById.mockResolvedValue(reembolsoMock);
        await expect(useCase.execute({ ...validInput, tipoArquivo: 'DOCX' })).rejects.toThrow(DomainError);
    });

    it('lança DomainError para tipo GIF (não permitido)', async () => {
        repos.reembolso.findById.mockResolvedValue(reembolsoMock);
        await expect(useCase.execute({ ...validInput, tipoArquivo: 'GIF' })).rejects.toThrow(DomainError);
    });

    it('não cria anexo se tipo for inválido', async () => {
        repos.reembolso.findById.mockResolvedValue(reembolsoMock);
        await expect(useCase.execute({ ...validInput, tipoArquivo: 'MP4' })).rejects.toThrow();
        expect(repos.anexo.create).not.toHaveBeenCalled();
    });
});
