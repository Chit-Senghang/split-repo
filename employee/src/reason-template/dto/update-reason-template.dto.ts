import { PartialType } from '@nestjs/swagger';
import { CreateReasonTemplateDto } from './create-reason-template.dto';

export class UpdateReasonTemplateDto extends PartialType(
  CreateReasonTemplateDto
) {}
