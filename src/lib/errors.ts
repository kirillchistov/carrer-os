export class UnauthorizedError extends Error {
  constructor(message = "Требуется вход в систему") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class NotFoundError extends Error {
  constructor(message = "Не найдено") {
    super(message)
    this.name = "NotFoundError"
  }
}
