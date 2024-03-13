import { In, Raw } from 'typeorm';
import { Inject } from '@nestjs/common';
import { IEmployeeRepository } from '../../../../../../employee/src/employee/repository/interface/employee.repository.interface';
import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { PaginationResponse } from '../../../../shared-resources/ts/interface/response.interface';
import { dayJs } from '../../../../shared-resources/common/utils/date-utils';
import {
  EmployeeWorkAnniversaryReportPaginationDto,
  employeeAnniversaryReportSearchableColumn
} from '../dto/employee-work-anniversary-report.pagination.dto';
import { EmployeeActiveStatusEnum } from './../../../../employee/enum/employee-status.enum';
import { EmployeeRepository } from './../../../../employee/repository/employee.repository';
import { EMPLOYEE_RELATIONSHIP } from './../../../../employee/constant/relationship.constant';
import { EMPLOYEE_SELECTED_FIELDS } from './../../../../employee/constant/selected-fields.constant';
import { IEmployeeWorkAnniversaryReportRepository } from './interface/employee-work-anniversary-report.interface';

export class EmployeeWorkAnniversaryReportRepository
  implements IEmployeeWorkAnniversaryReportRepository
{
  constructor(
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository
  ) {}

  async getEmployeeWithStartDateInMonth(
    pagination: EmployeeWorkAnniversaryReportPaginationDto
  ): Promise<PaginationResponse<Employee>> {
    return await this.employeeRepository.findAllWithPagination(
      pagination,
      employeeAnniversaryReportSearchableColumn,
      {
        where: {
          status: In(Object.values(EmployeeActiveStatusEnum)),
          gender: { id: pagination.genderId },
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
          startDate: this.getStartDateCondition(pagination)
        },
        relation: EMPLOYEE_RELATIONSHIP,
        select: EMPLOYEE_SELECTED_FIELDS,
        mapFunction: (employee: Employee) => {
          return {
            ...employee,
            nameKh: employee.displayFullNameKh,
            nameEn: employee.displayFullNameEn,
            gender: employee.gender.value,
            numberOfWorkingYear: this.calculateEmployeeAnniversary(
              employee.startDate,
              pagination.year
            )
          };
        }
      }
    );
  }

  private getStartDateCondition(
    pagination: EmployeeWorkAnniversaryReportPaginationDto
  ) {
    return Raw(
      (startDate) =>
        `EXTRACT(MONTH FROM ${startDate}) = '${pagination.month}' 
        AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, ${startDate})) > 0`
    );
  }

  private calculateEmployeeAnniversary(
    startDate: string | Date,
    year: number
  ): number {
    return dayJs()
      .set('year', year)
      .startOf('year')
      .diff(dayJs(startDate).startOf('year'), 'year');
  }
}
