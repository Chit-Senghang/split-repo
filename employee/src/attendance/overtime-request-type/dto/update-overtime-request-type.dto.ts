import { PartialType } from '@nestjs/swagger';
import { CreateOvertimeRequestTypeDto } from './create-overtime-request-type.dto';

export class UpdateOvertimeRequestTypeDto extends PartialType(
  CreateOvertimeRequestTypeDto
) {}
