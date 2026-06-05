import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';

export class UserLowReputationException extends BadRequestException {
  constructor() {
    super(
      'Usuário não possui a reputação mínima de 4.0 para solicitar empréstimos.',
    );
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
    super(
      'Usuário possui multas pendentes e não pode realizar novos empréstimos.',
    );
  }
}

export class MaxActiveLoansExceededException extends BadRequestException {
  constructor() {
    super('Limite máximo de 3 empréstimos ativos simultâneos atingido.');
  }
}

export class EmailAlreadyInUseException extends ConflictException {
  constructor() {
    super('Este e-mail já está em uso.');
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('Usuário não encontrado.');
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Credenciais inválidas.');
  }
}
