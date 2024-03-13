import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { EmployeePosition } from '../../employee-position/entities/employee-position.entity';
import { EmployeeStatusEnum } from '../enum/employee-status.enum';
import { WorkingShiftDto } from './working-shift.dto';
import { ProfileDto } from './profile.dto';

@Exclude()
export class CurrentEmployeeDto {
  @Expose()
  id: number;

  @Expose()
  displayFullNameEn: string;

  @Expose()
  displayFullNameKh: string;

  @Expose()
  @Transform(({ obj }) => obj.gender.value)
  gender: string;

  @Expose()
  @Transform(({ obj }) =>
    obj.positions.map((position: EmployeePosition) => {
      return position.mpath;
    })
  )
  mpath: string[];

  @Expose({ name: 'workingShiftId' })
  @Type(() => WorkingShiftDto)
  workingShift: WorkingShiftDto;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.positions[0].companyStructureLocation.companyStructureComponent.name
  )
  location: string;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.positions[0].companyStructureOutlet.companyStructureComponent.name
  )
  store: string;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.positions[0].companyStructureDepartment.companyStructureComponent.name
  )
  department: string;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.positions[0].companyStructureTeam.companyStructureComponent.name
  )
  division: string;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.positions[0].companyStructurePosition.companyStructureComponent.name
  )
  position: string;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj.positions[0].companyStructurePosition.positionLevelId.levelNumber
  )
  levelNumber: string;

  @Expose()
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @Expose()
  status: EmployeeStatusEnum;
}
