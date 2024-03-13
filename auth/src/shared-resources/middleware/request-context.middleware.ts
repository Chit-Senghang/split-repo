import { RequestContext } from './request';

export function RequestContextMiddleware(req, res, next) {
  new RequestContext(req, res);
  next();
}
