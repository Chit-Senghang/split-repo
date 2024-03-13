import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  ValidateNested
} from 'class-validator';
import { UpdatePositionDto } from './update-position.dto';

export class DeleteAndInsertEmployeePositionDto {
  @IsArray()
  @ValidateNested()
  @IsDefined()
  @ArrayMinSize(1)
  @Type(() => UpdatePositionDto)
  positions: UpdatePositionDto[];
}
