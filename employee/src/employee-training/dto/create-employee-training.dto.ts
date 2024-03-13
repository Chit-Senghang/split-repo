import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateEmployeeTrainingDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  trainingId: number;
}
