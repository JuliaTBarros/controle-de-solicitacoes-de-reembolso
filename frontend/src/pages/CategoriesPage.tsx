import { useState, useEffect } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useCategories } from '../hooks/useCategories';
import { useCategoryActions } from '../hooks/useCategoryActions';
import { Category } from '../types/category';
import { categorySchema, type CategoryData } from '../lib/schemas';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../components/ui/form';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const { data: fetched, loading, error } = useCategories();
  const { create, update, loading: actionLoading, error: actionError } = useCategoryActions();

  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen]  = useState(false);
  const [editing,    setEditing]     = useState<Category | null>(null);

  useEffect(() => {
    setCategories(fetched);
  }, [fetched]);

  const sorted = [...categories].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return a.name.localeCompare(b.name, 'pt-BR');
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
  }

  async function handleSave(data: CategoryData) {
    try {
      if (editing) {
        const updated = await update(editing.id, { name: data.name });
        setCategories(prev => prev.map(c => c.id === editing.id ? updated : c));
        toast.success('Categoria atualizada!');
      } else {
        const created = await create(data);
        setCategories(prev => [...prev, created]);
        toast.success('Categoria criada!');
      }
      closeDialog();
    } catch {
      // error exibido no dialog via actionError
    }
  }

  async function handleToggle(category: Category) {
    try {
      const updated = await update(category.id, { active: !category.active });
      setCategories(prev => prev.map(c => c.id === category.id ? updated : c));
      toast.success(updated.active ? 'Categoria ativada.' : 'Categoria inativada.');
    } catch {
      // error exibido via actionError
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Categorias</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gerencie as categorias disponíveis para solicitações de reembolso.
            </p>
          </div>
          <Button onClick={openCreate} disabled={actionLoading}>
            <Plus className="w-4 h-4" />
            Nova categoria
          </Button>
        </div>

        {actionError && <ErrorAlert message={actionError} />}

        {loading && <LoadingSpinner />}

        {!loading && error && <ErrorAlert message={error} />}

        {!loading && !error && (
          <div className="border rounded-lg overflow-hidden bg-card">
            {sorted.length === 0 ? (
              <div className="flex justify-center items-center py-16 text-sm text-muted-foreground">
                Nenhuma categoria cadastrada.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold">Nome</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(category => (
                    <tr
                      key={category.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{category.name}</td>

                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          category.active
                            ? 'bg-secondary/10 text-secondary'
                            : 'bg-muted text-muted-foreground',
                        )}>
                          {category.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(category)}
                            disabled={actionLoading}
                          >
                            <Pencil className="w-4 h-4" />
                            Editar
                          </Button>
                          <Switch
                            checked={category.active}
                            onCheckedChange={() => handleToggle(category)}
                            disabled={actionLoading}
                            aria-label={category.active ? 'Inativar categoria' : 'Ativar categoria'}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

      <CategoryDialog
        open={dialogOpen}
        editing={editing}
        onClose={closeDialog}
        onSave={handleSave}
        loading={actionLoading}
        error={actionError}
      />
    </Layout>
  );
}

// ─── Dialog de criação / edição ───────────────────────────────────────────────

interface CategoryDialogProps {
  open:    boolean;
  editing: Category | null;
  onClose: () => void;
  onSave:  (data: CategoryData) => Promise<void>;
  loading: boolean;
  error:   string | null;
}

function CategoryDialog({ open, editing, onClose, onSave, loading, error }: CategoryDialogProps) {
  const form = useForm<CategoryData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) form.reset({ name: editing?.name ?? '' });
  }, [open, editing, form]);

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Editar categoria' : 'Nova categoria'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive -mt-2">{error}</p>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Alimentação"
                      autoFocus
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Salvando…'
                  : editing ? 'Salvar alterações' : 'Criar categoria'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
