import { useState } from 'react';
import { Category } from '../types/category';
import { categoryService } from '../services/categoryService';

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name?: string;
  active?: boolean;
}

export function useCategoryActions() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao executar ação.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const create = (data: CreateCategoryData): Promise<Category> =>
    run(() => categoryService.create(data));

  const update = (id: string, data: UpdateCategoryData): Promise<Category> =>
    run(() => categoryService.update(id, data));

  return { create, update, loading, error };
}
