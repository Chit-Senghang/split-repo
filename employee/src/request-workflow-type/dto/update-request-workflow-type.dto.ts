import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRequestWorkflowTypeDto {
  @IsNotEmpty()
  @IsString()
  description: string;
}
