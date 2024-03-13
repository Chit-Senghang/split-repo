import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  getStringValue(keyName: string): string {
    return this.configService.get<string>(keyName);
  }

  getNumberValue(keyName: string): number {
    return this.configService.get<number>(keyName);
  }
}
