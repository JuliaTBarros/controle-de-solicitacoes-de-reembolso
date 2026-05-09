import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reimbursementSchema, ReimbursementData } from '../lib/schemas';
import { useCategories } from '../hooks/useCategories';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  defaultValues?: Partial<ReimbursementData>;
  onSaveDraft:    (data: ReimbursementData) => Promise<void>;
  onSendToReview: (data: ReimbursementData) => Promise<void>;
  isSaving?:      boolean;
  isSending?:     boolean;
}

export function ReimbursementForm({
  defaultValues,
  onSaveDraft,
  onSendToReview,
  isSaving,
  isSending,
}: Props) {
  const { data: categories, loading: loadingCats } = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReimbursementData>({
    resolver:      zodResolver(reimbursementSchema) as Resolver<ReimbursementData>,
    defaultValues,
  });

  if (loadingCats) return <LoadingSpinner />;

  const activeCategories = categories.filter(c => c.active);
  const isDisabled = isSaving || isSending;

  return (
    <form className="space-y-5">
      <div>
        <label className="text-sm font-medium block mb-1.5">Descrição *</label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Descreva detalhadamente a despesa realizada…"
          disabled={isDisabled}
          className="w-full border rounded-md px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Valor (R$) *</label>
          <input
            {...register('amount')}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            disabled={isDisabled}
            className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {errors.amount && (
            <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">Data da despesa *</label>
          <input
            {...register('expenseDate')}
            type="date"
            disabled={isDisabled}
            className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {errors.expenseDate && (
            <p className="text-xs text-destructive mt-1">{errors.expenseDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">Categoria *</label>
        <select
          {...register('categoryId')}
          disabled={isDisabled}
          className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Selecione uma categoria…</option>
          {activeCategories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit(onSaveDraft)}
          disabled={isDisabled}
          className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Salvando…' : 'Salvar rascunho'}
        </button>
        <button
          type="button"
          onClick={handleSubmit(onSendToReview)}
          disabled={isDisabled}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Enviando…' : 'Enviar para análise →'}
        </button>
      </div>
    </form>
  );
}
