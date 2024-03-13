import { Inject, Injectable } from '@nestjs/common';
import { IEmployeeRepository } from '../../../../../employee/src/employee/repository/interface/employee.repository.interface';
import { UtilityService } from '../../../../../employee/src/utility/utility.service';
import { EmployeeRepository } from '../../../../../employee/src/employee/repository/employee.repository';
import { ResourceConflictException } from '../../../shared-resources/exception/conflict-resource.exception';
import { ReportEnum } from '../../enums/report.enum';

@Injectable()
export class ReportEmployeePersonalInformationService {
  constructor(
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    private readonly utilityService: UtilityService
  ) {}

  async reportEmployeePersonalInformation() {
    const employeeIds =
      await this.utilityService.checkCurrentUserLoginWithESSUser();

    const isAdmin = await this.utilityService.checkIsAdmin();
    if (isAdmin) {
      throw new ResourceConflictException(
        'permission',
        `You don't has permission`
      );
    }
    const employee = await this.employeeRepo.getEmployeeById(employeeIds.at(0));
    return {
      reportId: ReportEnum.REPORT_EMPLOYEE_PERSONAL_INFO,
      ...employee
    };
  }
}
