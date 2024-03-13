import { Request } from 'express';

export function getCurrentUserFromHeader(reqeust: Request) {
  const userId = Number(reqeust.headers['x-consumer-custom-id']);
  return userId;
}
