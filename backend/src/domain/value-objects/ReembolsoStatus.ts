export enum ReembolsoStatus {
    RASCUNHO = 'RASCUNHO',
    ENVIADO = 'ENVIADO',
    APROVADO = 'APROVADO',
    REJEITADO = 'REJEITADO',
    PAGO = 'PAGO',
    CANCELADO = 'CANCELADO',
}

export const VALID_TRANSITIONS: Record<ReembolsoStatus, ReembolsoStatus[]> = {
    [ReembolsoStatus.RASCUNHO]: [ReembolsoStatus.ENVIADO, ReembolsoStatus.CANCELADO],
    [ReembolsoStatus.ENVIADO]: [ReembolsoStatus.APROVADO, ReembolsoStatus.REJEITADO],
    [ReembolsoStatus.APROVADO]: [ReembolsoStatus.PAGO],
    [ReembolsoStatus.REJEITADO]: [],
    [ReembolsoStatus.PAGO]: [],
    [ReembolsoStatus.CANCELADO]: [],
};

export function isValidTransition(from: ReembolsoStatus, to: ReembolsoStatus): boolean {
    return VALID_TRANSITIONS[from].includes(to);
}