import { ExecutionContext } from '@nestjs/common';

export const rateLimitEmployee = (context: ExecutionContext) => {
  const path = context.switchToHttp().getRequest().route.path;
  if (empRateLimitPath.includes(path)) {
    return false;
  }

  return true;
};

export const rateLimitAuth = (context: ExecutionContext) => {
  const path = context.switchToHttp().getRequest().route.path;
  if (authRateLimitPath.includes(path) && !process.env.TEST_MODE) {
    return false;
  }

  return true;
};

const empRateLimitPath = [];

const authRateLimitPath = ['/login'];
