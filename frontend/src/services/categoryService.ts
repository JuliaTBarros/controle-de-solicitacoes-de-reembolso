import { api } from '../lib/api';
import { Category } from '../types/category';

function mapCategory(raw: any): Category {
  return {
    id:     String(raw.id),
    name:   raw.nome,
    active: raw.ativo,
  };
}

export const categoryService = {
  list: (): Promise<Category[]> =>
    api.get('/categories').then(r => r.data.map(mapCategory)),

  create: (data: { name: string }): Promise<Category> =>
    api.post('/categories', { nome: data.name }).then(r => mapCategory(r.data)),

  update: (id: string, data: { name?: string; active?: boolean }): Promise<Category> =>
    api.put(`/categories/${id}`, {
      ...(data.name   !== undefined && { nome: data.name }),
      ...(data.active !== undefined && { ativo: data.active }),
    }).then(r => mapCategory(r.data)),
};
