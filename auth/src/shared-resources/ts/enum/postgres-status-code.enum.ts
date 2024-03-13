export enum PostgresqlStatusCode {
  UNIQUE_VIOLATION = '23505',
  INVALID_TEXT_REPRESENTATION = '22P02',
  FOREIGN_KEY_VIOLATION = '23503',
  UNDEFINED_COLUMN = '42703',
  NOT_NULL_VIOLATION = '23502'
}