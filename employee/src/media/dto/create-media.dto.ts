import { IsIn, IsOptional, IsString } from 'class-validator';
import { MediaEntityTypeEnum } from '../common/ts/enums/entity-type.enum';

export class CreateMediaDto {
  @IsOptional()
  @IsString()
  entityId: string;

  @IsOptional()
  @IsIn(Object.keys(MediaEntityTypeEnum))
  entityType: MediaEntityTypeEnum;
}
