import { PartialType } from '@nestjs/swagger';
import { CreateFingerPrintDeviceDto } from './create-finger-print-device.dto';

export class UpdateFingerPrintDeviceDto extends PartialType(
  CreateFingerPrintDeviceDto
) {}
