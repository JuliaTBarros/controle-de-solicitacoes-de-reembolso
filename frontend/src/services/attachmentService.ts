import { api } from '../lib/api';
import { Attachment } from '../types/attachment';

function mapAttachment(raw: any): Attachment {
  return {
    id:              String(raw.id),
    reimbursementId: String(raw.solicitacaoId),
    fileName:        raw.nomeArquivo,
    fileUrl:         raw.urlArquivo,
    fileType:        raw.tipoArquivo,
    createdAt:       raw.criadoEm,
  };
}

export const attachmentService = {
  list: (reimbursementId: string): Promise<Attachment[]> =>
    api.get(`/reimbursements/${reimbursementId}/attachments`)
       .then(r => r.data.map(mapAttachment)),

  upload: (reimbursementId: string, file: File): Promise<Attachment> => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/reimbursements/${reimbursementId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => mapAttachment(r.data));
  },
};
