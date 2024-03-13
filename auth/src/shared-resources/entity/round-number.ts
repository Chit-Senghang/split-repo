import { ValueTransformer } from 'typeorm/decorator/options/ValueTransformer';

export class RoundTransform implements ValueTransformer {
  from(value: any) {
    return Math.round(value * 100) / 100;
  }

  to(value: any) {
    return value;
  }
}
