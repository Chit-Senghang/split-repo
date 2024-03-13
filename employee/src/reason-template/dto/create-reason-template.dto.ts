import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReasonTemplateTypeEnum } from '../common/ts/enum/type.enum';

export class CreateReasonTemplateDto {
  @IsNotEmpty()
  @IsIn(Object.values(ReasonTemplateTypeEnum))
  @MaxLength(100)
  type: ReasonTemplateTypeEnum;

  @IsNotEmpty()
  @IsString()
  name: string;
}
