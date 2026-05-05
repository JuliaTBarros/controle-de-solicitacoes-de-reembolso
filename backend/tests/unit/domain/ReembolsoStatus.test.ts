import { ReembolsoStatus, isValidTransition, VALID_TRANSITIONS } from '../../../src/domain/value-objects/ReembolsoStatus';

describe('ReembolsoStatus - isValidTransition', () => {
    describe('transições válidas', () => {
        it('RASCUNHO → ENVIADO', () => {
            expect(isValidTransition(ReembolsoStatus.RASCUNHO, ReembolsoStatus.ENVIADO)).toBe(true);
        });

        it('RASCUNHO → CANCELADO', () => {
            expect(isValidTransition(ReembolsoStatus.RASCUNHO, ReembolsoStatus.CANCELADO)).toBe(true);
        });

        it('ENVIADO → APROVADO', () => {
            expect(isValidTransition(ReembolsoStatus.ENVIADO, ReembolsoStatus.APROVADO)).toBe(true);
        });

        it('ENVIADO → REJEITADO', () => {
            expect(isValidTransition(ReembolsoStatus.ENVIADO, ReembolsoStatus.REJEITADO)).toBe(true);
        });

        it('ENVIADO → CANCELADO', () => {
            expect(isValidTransition(ReembolsoStatus.ENVIADO, ReembolsoStatus.CANCELADO)).toBe(true);
        });

        it('APROVADO → PAGO', () => {
            expect(isValidTransition(ReembolsoStatus.APROVADO, ReembolsoStatus.PAGO)).toBe(true);
        });
    });

    describe('transições inválidas', () => {
        it('RASCUNHO → APROVADO', () => {
            expect(isValidTransition(ReembolsoStatus.RASCUNHO, ReembolsoStatus.APROVADO)).toBe(false);
        });

        it('RASCUNHO → PAGO', () => {
            expect(isValidTransition(ReembolsoStatus.RASCUNHO, ReembolsoStatus.PAGO)).toBe(false);
        });

        it('RASCUNHO → REJEITADO', () => {
            expect(isValidTransition(ReembolsoStatus.RASCUNHO, ReembolsoStatus.REJEITADO)).toBe(false);
        });

        it('ENVIADO → PAGO (sem aprovação)', () => {
            expect(isValidTransition(ReembolsoStatus.ENVIADO, ReembolsoStatus.PAGO)).toBe(false);
        });

        it('ENVIADO → RASCUNHO', () => {
            expect(isValidTransition(ReembolsoStatus.ENVIADO, ReembolsoStatus.RASCUNHO)).toBe(false);
        });

        it('APROVADO → REJEITADO', () => {
            expect(isValidTransition(ReembolsoStatus.APROVADO, ReembolsoStatus.REJEITADO)).toBe(false);
        });

        it('APROVADO → CANCELADO', () => {
            expect(isValidTransition(ReembolsoStatus.APROVADO, ReembolsoStatus.CANCELADO)).toBe(false);
        });

        it('PAGO → qualquer status', () => {
            const allStatuses = Object.values(ReembolsoStatus);
            allStatuses.forEach(s => {
                expect(isValidTransition(ReembolsoStatus.PAGO, s)).toBe(false);
            });
        });

        it('REJEITADO → qualquer status', () => {
            const allStatuses = Object.values(ReembolsoStatus);
            allStatuses.forEach(s => {
                expect(isValidTransition(ReembolsoStatus.REJEITADO, s)).toBe(false);
            });
        });

        it('CANCELADO → qualquer status', () => {
            const allStatuses = Object.values(ReembolsoStatus);
            allStatuses.forEach(s => {
                expect(isValidTransition(ReembolsoStatus.CANCELADO, s)).toBe(false);
            });
        });
    });

    describe('VALID_TRANSITIONS map', () => {
        it('PAGO não tem destinos permitidos', () => {
            expect(VALID_TRANSITIONS[ReembolsoStatus.PAGO]).toHaveLength(0);
        });

        it('REJEITADO não tem destinos permitidos', () => {
            expect(VALID_TRANSITIONS[ReembolsoStatus.REJEITADO]).toHaveLength(0);
        });

        it('CANCELADO não tem destinos permitidos', () => {
            expect(VALID_TRANSITIONS[ReembolsoStatus.CANCELADO]).toHaveLength(0);
        });
    });
});
