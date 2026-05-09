import { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const [data,    setData]    = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    categoryService.list()
      .then(setData)
      .catch(err => setError(err.response?.data?.message ?? 'Erro ao carregar categorias.'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
