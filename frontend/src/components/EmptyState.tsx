interface Props {
  message?: string;
}

export function EmptyState({ message = 'Nenhum item encontrado.' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p className="text-sm">{message}</p>
    </div>
  );
}
