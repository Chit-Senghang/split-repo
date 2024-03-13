import { execSync } from 'child_process';
import { Body, Controller, Logger, Post } from '@nestjs/common';
import { GrpcService } from '../grpc/grpc.service';

@Controller('system-test')
export class SystemTestController {
  constructor(private readonly grpcService: GrpcService) {}

  @Post('set-date')
  async setDateOnServer(@Body() setDateDto: { date: string }) {
    if (process.env.TEST_MODE) {
      try {
        execSync(`date "${setDateDto.date}"`);
        await this.grpcService.setDateOnEmployeeServer(setDateDto.date);
        Logger.log(`System date changed to ${setDateDto.date}`);
      } catch (error) {
        Logger.error('Error changing system date:', error.message);
      }
    }
  }
}
