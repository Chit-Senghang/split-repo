import { DataSource, In, Raw } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { dayJs } from '../../shared-resources/common/utils/date-utils';
import {
  DEFAULT_MONTH_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../../shared-resources/common/dto/default-date-format';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeResignation } from '../entity/employee-resignation.entity';
import { EmployeeResignationStatusEnum } from '../common/ts/enums/employee-resignation-status.enum';
import { IEmployeeResignationRepository } from './interface/employee-resignation.repository.interface';
import { FindResignDateAndStatus } from './interface/employee-resignation.type';

@Injectable()
export class EmployeeResignationRepository
  extends RepositoryBase<EmployeeResignation>
  implements IEmployeeResignationRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(EmployeeResignation));
  }

  async getEmployeeResignationByEmployeeId(
    employeeId: number
  ): Promise<EmployeeResignation> {
    return await this.findOne({
      where: {
        employee: { id: employeeId },
        status: In([
          EmployeeResignationStatusEnum.ACTIVE,
          EmployeeResignationStatusEnum.IN_SCHEDULE
        ])
      },
      relations: { employee: true },
      select: { employee: { id: true } }
    });
  }

  async findResignDateDateAndStatus(
    option: FindResignDateAndStatus
  ): Promise<EmployeeResignation[]> {
    const getMonth: string = dayJs(option.resignDate).format(
      DEFAULT_MONTH_FORMAT
    );
    const getYear: string = dayJs(option.resignDate).format(
      DEFAULT_YEAR_FORMAT
    );
    return await this.find({
      where: {
        resignDate: Raw(
          (resignDate) =>
            `(EXTRACT(YEAR FROM ${resignDate}) = ${getYear} 
            AND EXTRACT(MONTH FROM ${resignDate}) = ${getMonth})`
        ),
        status: option.status
      }
    });
  }
}
