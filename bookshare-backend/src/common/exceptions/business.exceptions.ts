import { BadRequestException } from '@nestjs/common';

export class UserLowReputationException extends BadRequestException {
  constructor() {
    super('Usuário não possui a reputação mínima de 4.0 para solicitar empréstimos.');
  }
}

export class BookNotAvailableException extends BadRequestException {
  constructor() {
    super('O livro solicitado não está disponível no momento.');
  }
}

export class OwnBookLoanException extends BadRequestException {
  constructor() {
    super('Um usuário não pode solicitar empréstimo de seu próprio livro.');
  }
}

export class UserHasPendingFinesException extends BadRequestException {
  constructor() {
    super('Usuário possui multas pendentes e não pode realizar novos empréstimos.');
  }
}

export class MaxActiveLoansExceededException extends BadRequestException {
  constructor() {
    super('Limite máximo de 3 empréstimos ativos simultâneos atingido.');
  }
}