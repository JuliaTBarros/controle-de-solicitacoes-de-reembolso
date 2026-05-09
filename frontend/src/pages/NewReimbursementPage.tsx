import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { useCreateReimbursement } from '../hooks/useCreateReimbursement';
import { reimbursementService } from '../services/reimbursementService';
import { type ReimbursementData } from '../lib/schemas';
import { Layout } from '../components/Layout';
import { ErrorAlert } from '../components/ErrorAlert';
import { ReimbursementForm } from '../components/ReimbursementForm';

export default function NewReimbursementPage() {
  const navigate = useNavigate();
  const { create, error } = useCreateReimbursement();
  const [isSaving,  setIsSaving]  = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function handleSaveDraft(data: ReimbursementData) {
    setIsSaving(true);
    try {
      const reimbursement = await create(data);
      toast.success('Rascunho salvo!');
      navigate(`/reimbursements/${reimbursement.id}`);
    } catch {
      // error exibido via ErrorAlert
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendToReview(data: ReimbursementData) {
    setIsSending(true);
    try {
      const reimbursement = await create(data);
      await reimbursementService.submit(reimbursement.id);
      toast.success('Solicitação enviada para análise!');
      navigate('/');
    } catch {
      // error exibido via ErrorAlert
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            aria-label="Voltar"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Nova Solicitação</h1>
            <p className="text-sm text-muted-foreground">
              Preencha os dados da despesa realizada.
            </p>
          </div>
        </div>

        {error && <ErrorAlert message={error} />}

        <div className="border rounded-lg bg-card p-6">
          <ReimbursementForm
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
