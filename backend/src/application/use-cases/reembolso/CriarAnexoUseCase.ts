import {IReembolsoRepository} from '../../../domain/repositories/IReembolsoRepository';
import {IAnexoRepository} from '../../../domain/repositories/IAnexoRepository';
import {Anexo} from '../../../domain/entities/Anexo';
import {NotFoundError} from '../../../domain/errors/NotFoundError';
import {UnauthorizedError} from '../../../domain/errors/UnauthorizedError';
import {DomainError} from '../../../domain/errors/DomainError';

const TIPOS_PERMITIDOS = ['PDF', 'JPG', 'PNG'] as const;

export interface CriarAnexoInput {
    solicitacaoId: number;
    solicitanteId: number;
    nomeArquivo: string;
    urlArquivo: string;
    tipoArquivo: string;
}

export class CriarAnexoUseCase {
    constructor(
        private reembolsoRepository: IReembolsoRepository,
        private anexoRepository: IAnexoRepository,
    ) {
    }

    async execute(input: CriarAnexoInput): Promise<Anexo> {
        const reembolso = await this.reembolsoRepository.findById(input.solicitacaoId);
        if (!reembolso) throw new NotFoundError('Solicitação de reembolso');

        if (reembolso.solicitanteId !== input.solicitanteId) {
            throw new UnauthorizedError('Apenas o dono pode adicionar anexos a esta solicitação.');
        }

        const tipo = input.tipoArquivo.toUpperCase();
        if (!TIPOS_PERMITIDOS.includes(tipo as typeof TIPOS_PERMITIDOS[number])) {
            throw new DomainError(`Tipo de arquivo inválido. Permitidos: ${TIPOS_PERMITIDOS.join(', ')}.`, 400);
        }

        return this.anexoRepository.create({
            solicitacaoId: input.solicitacaoId,
            nomeArquivo: input.nomeArquivo,
            urlArquivo: input.urlArquivo,
            tipoArquivo: tipo,
        });
    }
}
