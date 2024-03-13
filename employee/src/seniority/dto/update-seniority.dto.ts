import { PartialType } from '@nestjs/swagger';
import { CreateSeniorityDto } from './create-seniority.dto';

export class UpdateSeniorityDto extends PartialType(CreateSeniorityDto) {}
