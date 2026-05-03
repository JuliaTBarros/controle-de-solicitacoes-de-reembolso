import { DomainError } from './DomainError';

export class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Transição de status inválida: ${from} → ${to}.`, 400);
    this.name = 'InvalidStatusTransitionError';
  }
}
