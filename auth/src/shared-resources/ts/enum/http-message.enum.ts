export enum HttpMessage {
  OK = 'Request successful',
  CREATED = 'Object created',
  ACCEPTED = 'Request accepted',
  BAD_REQUEST = 'Bad request',
  UNAUTHORIZED = 'Unauthorized',
  PAYMENT_REQUIRED = 'Payment required',
  FORBIDDEN = 'Resource forbidden',
  NOT_FOUND = 'Resource not found',
  REQUEST_TIMEOUT = 'Request timeout',
  CONFLICT = 'Resource conflict error',
  I_AM_A_TEAPOT = 'I am a tea pot',
  UNPROCESSABLE_ENTITY = 'Validation error',
  INTERNAL_SERVER_ERROR = 'Internal server error',
  TOO_MANY_REQUEST = 'Too many request'
}
