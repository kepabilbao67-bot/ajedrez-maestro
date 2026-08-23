export class AiEngineError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AiEngineError';
  }
}

export class AiTimeoutError extends AiEngineError {
  constructor(message = 'El motor superó el tiempo máximo de análisis') {
    super(message);
    this.name = 'AiTimeoutError';
  }
}

export class AiCancelledError extends AiEngineError {
  constructor(message = 'Análisis cancelado') {
    super(message);
    this.name = 'AiCancelledError';
  }
}

export class AiIllegalMoveError extends AiEngineError {
  constructor(message = 'El motor propuso un movimiento no permitido por ChessGame') {
    super(message);
    this.name = 'AiIllegalMoveError';
  }
}
