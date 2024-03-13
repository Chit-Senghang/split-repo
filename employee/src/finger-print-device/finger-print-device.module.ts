import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FingerPrintDeviceService } from './finger-print-device.service';
import { FingerPrintDeviceController } from './finger-print-device.controller';
import { FingerprintDevice } from './entities/finger-print-device.entity';

@Module({
  controllers: [FingerPrintDeviceController],
  providers: [FingerPrintDeviceService],
  imports: [TypeOrmModule.forFeature([FingerprintDevice])],
  exports: [FingerPrintDeviceService]
})
export class FingerPrintDeviceModule {}
