import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rejectSchema, RejectData } from '../lib/schemas';

interface Props {
  open:      boolean;
  onClose:   () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading?:  boolean;
}

export function RejectDialog({ open, onClose, onConfirm, loading }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectData>({ resolver: zodResolver(rejectSchema) });

  if (!open) return null;

  async function onSubmit(data: RejectData) {
    await onConfirm(data.reason);
    reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-1">Rejeitar Solicitação</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Informe o motivo da rejeição. Ele ficará visível ao colaborador.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Justificativa *
            </label>
            <textarea
              {...register('reason')}
              rows={4}
              placeholder="Descreva o motivo da rejeição…"
              className="w-full border rounded-md px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
            />
            {errors.reason && (
              <p className="text-xs text-destructive mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Rejeitando…' : 'Confirmar Rejeição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
