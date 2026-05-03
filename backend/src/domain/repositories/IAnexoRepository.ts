import { Anexo } from '../entities/Anexo';

export interface CreateAnexoData {
  solicitacaoId: number;
  nomeArquivo: string;
  urlArquivo: string;
  tipoArquivo: string;
}

export interface IAnexoRepository {
  create(data: CreateAnexoData): Promise<Anexo>;

  findBySolicitacaoId(solicitacaoId: number): Promise<Anexo[]>;

  findById(id: number): Promise<Anexo | null>;

  delete(id: number): Promise<void>;
}