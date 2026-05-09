import { FileText, FileImage, File, ExternalLink } from 'lucide-react';
import { Attachment } from '../types/attachment';

const TYPE_ICON: Record<string, React.ElementType> = {
  PDF: FileText,
  JPG: FileImage,
  PNG: FileImage,
};

interface Props {
  attachments: Attachment[];
}

export function AttachmentList({ attachments }: Props) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum anexo.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {attachments.map(att => {
        const type = att.fileType.toUpperCase();
        const Icon = TYPE_ICON[type] ?? File;

        return (
          <li
            key={att.id}
            className="flex items-center gap-3 p-3 border rounded-md bg-card"
          >
            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{att.fileName}</p>
              <p className="text-xs text-muted-foreground uppercase">{att.fileType}</p>
            </div>
            <a
              href={att.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
              Ver
            </a>
          </li>
        );
      })}
    </ul>
  );
}
