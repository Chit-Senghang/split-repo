import { PartialType } from '@nestjs/swagger';
import { CreateMissedScanRequestDto } from './create-missed-scan-request.dto';

export class UpdateMissedScanRequestDto extends PartialType(
  CreateMissedScanRequestDto
) {}
