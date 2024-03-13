import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeTrainingDto } from './create-employee-training.dto';

export class UpdateEmployeeTrainingDto extends PartialType(
  CreateEmployeeTrainingDto
) {}
