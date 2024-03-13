import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class WorkingShiftDto {
  @Expose()
  id: number;

  @Expose()
  @Transform(({ obj }) => obj.workshiftType?.name)
  name: string;

  @Expose()
  startWorkingTime: Date;

  @Expose()
  endWorkingTime: Date;
}
