import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { WorkingShift } from '../../entities/working-shift.entity';

export interface IWorkingShiftRepository extends IRepositoryBase<WorkingShift> {
  findWorkingShiftById(id: number): Promise<WorkingShift>;
}
