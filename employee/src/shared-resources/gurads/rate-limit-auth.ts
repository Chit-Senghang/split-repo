import { ThrottlerGuard } from '@nestjs/throttler';
import { ResourceTooManyRequestException } from '../exception/too-many-request.exception';

export class RateLimitGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    return req.id;
  }

  protected throwThrottlingException(): void {
    throw new ResourceTooManyRequestException('Too many request');
  }
}
