import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateEmployeeSkillDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'You should choose skill at less one' })
  skillId: number;
}
