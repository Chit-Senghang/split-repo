import { PartialType } from '@nestjs/swagger';
import { CreateOvertimeRequestDto } from './create-overtime_request.dto';

export class UpdateOvertimeRequestDto extends PartialType(
  CreateOvertimeRequestDto
) {}
