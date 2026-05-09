import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../contexts/AuthContext';
import { useReimbursement } from '../hooks/useReimbursement';
import { useReimbursementHistory } from '../hooks/useReimbursementHistory';
import { useReimbursementActions } from '../hooks/useReimbursementActions';
import { useCategories } from '../hooks/useCategories';
import { attachmentService } from '../services/attachmentService';
import { ReimbursementStatus } from '../types/reimbursement';
import { Attachment } from '../types/attachment';

import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { StatusBadge } from '../components/StatusBadge';
import { ActionButtons } from '../components/ActionButtons';
import { HistoryTimeline } from '../components/HistoryTimeline';
import { AttachmentList } from '../components/AttachmentList';
import { RejectDialog } from '../components/RejectDialog';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { formatCurrency, formatDate, formatDateTime } from '../lib/formatters';

export default function ReimbursementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: reimbursement, loading, error, refetch } = useReimbursement(id!);
  const { data: history, loading: historyLoading, refetch: refetchHistory } = useReimbursementHistory(id!);
  const { data: categories } = useCategories();
  const { submit, approve, reject, pay, cancel, loadingAction, error: actionError } = useReimbursementActions(id!);

  const [rejectOpen,       setRejectOpen]       = useState(false);
  const [attachments,      setAttachments]      = useState<Attachment[]>([]);
  const [attachLoading,    setAttachLoading]    = useState(true);
  const [uploading,        setUploading]        = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    setAttachLoading(true);
    attachmentService.list(id)
      .then(setAttachments)
      .catch(() => {})
      .finally(() => setAttachLoading(false));
  }, [id]);

  const categoryName = categories.find(c => c.id === reimbursement?.categoryId)?.name ?? '—';

  const isDraft   = reimbursement?.status === ReimbursementStatus.DRAFT;
  const isOwner   = !!user && !!reimbursement && user.id === reimbursement.requesterId;
  const canEdit   = isOwner && isDraft;
  const canUpload = isOwner && isDraft;

  async function handleSubmit() {
    try {
      await submit();
      toast.success('Solicitação enviada para análise!');
      refetch();
      refetchHistory();
    } catch {}
  }

  async function handleApprove() {
    try {
      await approve();
      toast.success('Solicitação aprovada!');
      refetch();
      refetchHistory();
    } catch {}
  }

  async function handleReject(reason: string) {
    try {
      await reject(reason);
      toast.success('Solicitação rejeitada.');
      setRejectOpen(false);
      refetch();
      refetchHistory();
    } catch {}
  }

  async function handlePay() {
    try {
      await pay();
      toast.success('Solicitação marcada como paga!');
      refetch();
      refetchHistory();
    } catch {}
  }

  async function handleCancel() {
    try {
      await cancel();
      toast.success('Solicitação cancelada.');
      refetch();
      refetchHistory();
    } catch {}
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    e.target.value = '';

    setUploading(true);
    try {
      const att = await attachmentService.upload(id, file);
      setAttachments(prev => [...prev, att]);
      toast.success('Anexo enviado!');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao enviar anexo.';
      toast.error(msg);
    } finally {
      setUploading(false);
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

  if (error || !reimbursement) {
    return (
      <Layout>
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <ErrorAlert message={error ?? 'Solicitação não encontrada.'} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight truncate">
                {reimbursement.description}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={reimbursement.status} />
                <span className="text-xs text-muted-foreground">
                  Criada em {formatDateTime(reimbursement.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/reimbursements/${id}/edit`)}
              className="shrink-0"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
          )}
        </div>

        {/* Action error */}
        {actionError && <ErrorAlert message={actionError} />}

        {/* Action buttons */}
        <ActionButtons
          status={reimbursement.status}
          requesterId={reimbursement.requesterId}
          disabled={loadingAction !== null}
          onSubmit={handleSubmit}
          onApprove={handleApprove}
          onReject={() => setRejectOpen(true)}
          onPay={handlePay}
          onCancel={handleCancel}
        />

        {/* Details card */}
        <div className="border rounded-lg bg-card">
          <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailField label="Valor">
              {formatCurrency(reimbursement.amount)}
            </DetailField>
            <DetailField label="Data da despesa">
              {formatDate(reimbursement.expenseDate)}
            </DetailField>
            <DetailField label="Categoria" className="col-span-2">
              {categoryName}
            </DetailField>
            <DetailField label="Descrição" className="col-span-2">
              {reimbursement.description}
            </DetailField>
            {reimbursement.rejectionReason && (
              <DetailField label="Justificativa de rejeição" className="col-span-2">
                <span className="text-destructive">{reimbursement.rejectionReason}</span>
              </DetailField>
            )}
          </div>
        </div>

        {/* Tabs: Histórico | Anexos */}
        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="attachments">
              Anexos {attachments.length > 0 && `(${attachments.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="pt-4">
            {historyLoading ? (
              <LoadingSpinner />
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum registro no histórico.</p>
            ) : (
              <HistoryTimeline history={history} />
            )}
          </TabsContent>

          <TabsContent value="attachments" className="pt-4 space-y-4">
            {canUpload && (
              <>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? 'Enviando…' : 'Adicionar anexo'}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    PDF, JPG ou PNG
                  </span>
                </div>
                <Separator />
              </>
            )}

            {attachLoading ? (
              <LoadingSpinner />
            ) : (
              <AttachmentList attachments={attachments} />
            )}
          </TabsContent>
        </Tabs>

      </div>

      <RejectDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        loading={loadingAction === 'reject'}
      />
    </Layout>
  );
}

function DetailField({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
}
