import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class ProfileDto {
  @Expose()
  @Transform(({ obj }) => obj.name)
  name: string;

  @Expose()
  @Transform(({ obj }) => obj.mimeType)
  mimeType: string;
}
