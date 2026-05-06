export enum ReembolsoStatus {
    RASCUNHO = 'RASCUNHO',
    ENVIADO = 'ENVIADO',
    APROVADO = 'APROVADO',
    REJEITADO = 'REJEITADO',
    PAGO = 'PAGO',
    CANCELADO = 'CANCELADO',
}

// ENVIADO → CANCELADO é permitido intencionalmente: o colaborador pode desistir de uma solicitação
// já enviada antes que o gestor tome uma decisão. A rota /cancel exige perfil COLABORADOR e o
// use case verifica a posse da solicitação, impedindo cancelamentos indevidos.
export const VALID_TRANSITIONS: Record<ReembolsoStatus, ReembolsoStatus[]> = {
    [ReembolsoStatus.RASCUNHO]: [ReembolsoStatus.ENVIADO, ReembolsoStatus.CANCELADO],
    [ReembolsoStatus.ENVIADO]: [ReembolsoStatus.APROVADO, ReembolsoStatus.REJEITADO, ReembolsoStatus.CANCELADO],
    [ReembolsoStatus.APROVADO]: [ReembolsoStatus.PAGO],
    [ReembolsoStatus.REJEITADO]: [],
    [ReembolsoStatus.PAGO]: [],
    [ReembolsoStatus.CANCELADO]: [],
};

export function isValidTransition(from: ReembolsoStatus, to: ReembolsoStatus): boolean {
    return VALID_TRANSITIONS[from].includes(to);
}