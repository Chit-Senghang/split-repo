import { IsNotEmpty, IsString } from 'class-validator';

export class ColumnDefinitionDto {
  @IsNotEmpty()
  @IsString()
  header: string;

  @IsNotEmpty()
  @IsString()
  key: string;
}
