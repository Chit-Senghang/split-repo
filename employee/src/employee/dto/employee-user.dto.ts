import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class EmployeeAndUserTemplateDto {
  @IsInt()
  @Min(1)
  id: number;

  @IsString()
  name: string;

  @Type(() => EmployeeTemplate)
  employee: EmployeeTemplate;
}

export class EmployeeTemplate {
  @IsInt()
  @Min(1)
  id: number;

  @IsString()
  name: string;
}
