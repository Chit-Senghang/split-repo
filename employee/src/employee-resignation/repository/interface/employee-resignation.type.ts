import { FindOperator } from 'typeorm/find-options/FindOperator';
import { EmployeeResignationStatusEnum } from '../../common/ts/enums/employee-resignation-status.enum';

export type FindResignDateAndStatus = {
  resignDate: Date;
  status:
    | EmployeeResignationStatusEnum
    | FindOperator<EmployeeResignationStatusEnum>;
};
