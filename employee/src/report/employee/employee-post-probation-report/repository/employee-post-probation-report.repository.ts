import { Between, FindOperator, FindOptionsWhere, ILike, In } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Employee } from '../../../../../../employee/src/employee/entity/employee.entity';
import { PaginationResponse } from '../../../../shared-resources/ts/interface/response.interface';
import { dayJs } from '../../../../shared-resources/common/utils/date-utils';
import {
  EmployeePostProbationReportPaginationDto,
  employeePostProbationReportSearchableColumn
} from '../dto/employee-post-probation-report-pagination.dto';
import { IEmployeeRepository } from '../../../../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../../../../employee/repository/employee.repository';
import { EMPLOYEE_RELATIONSHIP } from '../../../../employee/constant/relationship.constant';
import { EMPLOYEE_SELECTED_FIELDS } from '../../../../employee/constant/selected-fields.constant';
import { EmployeeActiveStatusEnum } from './../../../../employee/enum/employee-status.enum';
import { IEmployeePostProbationReportRepository } from './interface/employee-post-probation-report.interface';

export class EmployeePostProbationReportRepository
  implements IEmployeePostProbationReportRepository
{
  constructor(
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository
  ) {}

  private getEmployeeFilterBirthdayConditions(
    pagination: EmployeePostProbationReportPaginationDto
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
      postProbationDate: this.getPostProbationDateCondition(pagination)
    };
  }

  async getAllEmployeeWithPostProbationInCurrentMonth(
    pagination: EmployeePostProbationReportPaginationDto
  ): Promise<PaginationResponse<Employee>> {
    const employeeFilterBirthdayConditions =
      this.getEmployeeFilterBirthdayConditions(pagination);
    return await this.employeeRepository.findAllWithPagination(
      pagination,
      employeePostProbationReportSearchableColumn,
      {
        where: [
          {
            ...employeeFilterBirthdayConditions,
            displayFullNameEn:
              pagination.displayName && ILike(`%${pagination.displayName}%`)
          },
          {
            ...employeeFilterBirthdayConditions,
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
            gender: employee.gender.value
          };
        }
      }
    );
  }

  private getPostProbationDateCondition(
    pagination: EmployeePostProbationReportPaginationDto
  ): FindOperator<Date> {
    const fromDate: Date = dayJs()
      .set('month', pagination.month)
      .set('year', pagination.year)
      .startOf('month')
      .toDate();

    const toDate: Date = dayJs()
      .set('month', pagination.month)
      .set('year', pagination.year)
      .endOf('month')
      .toDate();

    return Between(fromDate, toDate);
  }
}
