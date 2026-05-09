import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../contexts/AuthContext';
import { useReimbursement } from '../hooks/useReimbursement';
import { useUpdateReimbursement } from '../hooks/useUpdateReimbursement';
import { reimbursementService } from '../services/reimbursementService';
import { ReimbursementStatus } from '../types/reimbursement';
import { type ReimbursementData } from '../lib/schemas';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ReimbursementForm } from '../components/ReimbursementForm';

export default function EditReimbursementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: reimbursement, loading, error: loadError } = useReimbursement(id!);
  const { update, error: updateError } = useUpdateReimbursement();

  const [isSaving,  setIsSaving]  = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (loading || !reimbursement) return;

    const notDraft    = reimbursement.status !== ReimbursementStatus.DRAFT;
    const notOwner    = user?.id !== reimbursement.requesterId;

    if (notDraft || notOwner) {
      navigate(`/reimbursements/${id}`, { replace: true });
    }
  }, [reimbursement, loading, user, id, navigate]);

  async function handleSaveDraft(data: ReimbursementData) {
    setIsSaving(true);
    try {
      await update(id!, data);
      toast.success('Rascunho atualizado!');
      navigate(`/reimbursements/${id}`);
    } catch {
      // error exibido via ErrorAlert
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendToReview(data: ReimbursementData) {
    setIsSending(true);
    try {
      await update(id!, data);
      await reimbursementService.submit(id!);
      toast.success('Solicitação enviada para análise!');
      navigate('/');
    } catch {
      // error exibido via ErrorAlert
    } finally {
      setIsSending(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (loadError || !reimbursement) {
    return (
      <Layout>
        <div className="p-6 max-w-2xl mx-auto space-y-4">
          <button
            onClick={() => navigate('/')}
            aria-label="Voltar"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ErrorAlert message={loadError ?? 'Solicitação não encontrada.'} />
        </div>
      </Layout>
    );
  }

  const defaultValues: ReimbursementData = {
    description: reimbursement.description,
    amount:      reimbursement.amount,
    categoryId:  reimbursement.categoryId,
    expenseDate: reimbursement.expenseDate.substring(0, 10),
  };

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/reimbursements/${id}`)}
            aria-label="Voltar"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Editar Solicitação</h1>
            <p className="text-sm text-muted-foreground truncate max-w-md">
              {reimbursement.description}
            </p>
          </div>
        </div>

        {updateError && <ErrorAlert message={updateError} />}

        <div className="border rounded-lg bg-card p-6">
          <ReimbursementForm
            defaultValues={defaultValues}
            onSaveDraft={handleSaveDraft}
            onSendToReview={handleSendToReview}
            isSaving={isSaving}
            isSending={isSending}
          />
        </div>

      </div>
    </Layout>
  );
}
