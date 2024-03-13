import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CodeValueResponseDto {
  @Expose()
  id: number;

  @Expose({ name: 'value' })
  name: string;
}
