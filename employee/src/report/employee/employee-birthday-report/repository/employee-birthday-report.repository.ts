import { FindOperator, FindOptionsWhere, ILike, In, Raw } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { EmployeeActiveStatusEnum } from '../../../../../../employee/src/employee/enum/employee-status.enum';
import { dayJs } from '../../../../shared-resources/common/utils/date-utils';
import { PaginationResponse } from '../../../../shared-resources/ts/interface/response.interface';
import {
  EmployeeBirthdayReportPaginationDto,
  employeeBirthdayReportSearchableColumn
} from '../dto/employee-birthday-report-pagination.dto';
import { EMPLOYEE_SELECTED_FIELDS } from './../../../../employee/constant/selected-fields.constant';
import { EMPLOYEE_RELATIONSHIP } from './../../../../employee/constant/relationship.constant';
import { EmployeeRepository } from './../../../../employee/repository/employee.repository';
import { IEmployeeRepository } from './../../../../employee/repository/interface/employee.repository.interface';
import { IEmployeeBirthdayReportRepository } from './interface/employee-birthday-report.interface';

export class EmployeeBirthdayReportRepository
  implements IEmployeeBirthdayReportRepository
{
  constructor(
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository
  ) {}

  private getEmployeeFilterBirthdayConditions(
    pagination: EmployeeBirthdayReportPaginationDto
  ) {
    return {
      status: In(Object.values(EmployeeActiveStatusEnum)),
      gender: {
        id: pagination.genderId
      },
      positions: {
        companyStructureLocation: {
          id: pagination.locationId
        },
        companyStructureOutlet: {
          id: pagination.outletId
        },
        companyStructureDepartment: {
          id: pagination.departmentId
        },
        companyStructureTeam: {
          id: pagination.teamId
        },
        companyStructurePosition: {
          id: pagination.positionId
        }
      },
      dob: this.getDateOfBirthCondition(pagination)
    };
  }

  async getEmployeeWithBirthdayInMonth(
    pagination: EmployeeBirthdayReportPaginationDto
  ): Promise<PaginationResponse<Employee>> {
    const employeeBirthdayFilterConditions =
      this.getEmployeeFilterBirthdayConditions(pagination);
    return await this.employeeRepository.findAllWithPagination(
      pagination,
      employeeBirthdayReportSearchableColumn,
      {
        where: [
          {
            ...employeeBirthdayFilterConditions,
            displayFullNameEn:
              pagination.displayName && ILike(`%${pagination.displayName}%`)
          },
          {
            ...employeeBirthdayFilterConditions,
            displayFullNameKh:
              pagination.displayName && ILike(`%${pagination.displayName}%`)
          }
        ] as FindOptionsWhere<Employee>,
        relation: EMPLOYEE_RELATIONSHIP,
        select: EMPLOYEE_SELECTED_FIELDS,
        mapFunction: (employee: Employee) => {
          return {
            ...employee,
            nameKh: employee.displayFullNameKh,
            nameEn: employee.displayFullNameEn,
            gender: employee.gender.value,
            age: this.calculateEmployeeAge(employee.dob)
          };
        }
      }
    );
  }

  private getDateOfBirthCondition(
    pagination: EmployeeBirthdayReportPaginationDto
  ): FindOperator<Date> {
    return Raw(
      (dob: string) =>
        `(EXTRACT(MONTH FROM ${dob}) = ${pagination.month}) 
        AND ${dob} IS NOT NULL`
    );
  }

  private calculateEmployeeAge(dob: string | Date): number {
    return dayJs().startOf('year').diff(dayJs(dob).startOf('year'), 'year');
  }
}
