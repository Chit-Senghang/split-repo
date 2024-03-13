import { RequestContext } from '../middleware/request';

export function getCurrentUserFromContext() {
  const userId = RequestContext.currentRequestContext().request.headers;
  return Number(userId['x-consumer-custom-id']);
}
