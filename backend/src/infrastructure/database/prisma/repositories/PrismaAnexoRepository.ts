import {prisma} from '../client';
import {IAnexoRepository, CreateAnexoData} from '../../../../domain/repositories/IAnexoRepository';
import {Anexo} from '../../../../domain/entities/Anexo';

type PrismaAnexo = {
    id: number;
    solicitacaoId: number;
    nomeArquivo: string;
    urlArquivo: string;
    tipoArquivo: string;
    criadoEm: Date;
};

export class PrismaAnexoRepository implements IAnexoRepository {
    async create(data: CreateAnexoData): Promise<Anexo> {
        const record = await prisma.anexo.create({
            data: {
                solicitacaoId: Number(data.solicitacaoId),
                nomeArquivo: data.nomeArquivo,
                urlArquivo: data.urlArquivo,
                tipoArquivo: data.tipoArquivo,
            },
        });
        return this.toEntity(record);
    }

    async findBySolicitacaoId(solicitacaoId: number): Promise<Anexo[]> {
        const records = await prisma.anexo.findMany({
            where: {solicitacaoId: Number(solicitacaoId)},
        });
        return records.map(r => this.toEntity(r));
    }

    async findById(id: number): Promise<Anexo | null> {
        const record = await prisma.anexo.findUnique({where: {id: Number(id)}});
        return record ? this.toEntity(record) : null;
    }

    async delete(id: number): Promise<void> {
        await prisma.anexo.delete({where: {id: Number(id)}});
    }

    private toEntity(record: PrismaAnexo): Anexo {
        return new Anexo({
            id: Number(record.id),
            solicitacaoId: Number(record.solicitacaoId),
            nomeArquivo: record.nomeArquivo,
            urlArquivo: record.urlArquivo,
            tipoArquivo: record.tipoArquivo,
            criadoEm: record.criadoEm,
        });
    }
}
