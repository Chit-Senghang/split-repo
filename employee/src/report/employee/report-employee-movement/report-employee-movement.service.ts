import { Inject, Injectable } from '@nestjs/common';
import { checkIsValidYearFormat } from '../../../shared-resources/utils/validate-date-format';
import { DEFAULT_DATE_FORMAT } from '../../../shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDate
} from '../../../shared-resources/common/utils/date-utils';
import { ReportEnum } from '../../enums/report.enum';
import { ResponseReportEmployeeMovementDto } from './dto/response-report-employee-movement.dto';
import { PaginationReportEmployeeMovementDto } from './dto/pagination-report-employee-movement.dto';
import { ReportEmployeeMovementRepository } from './repository/report-employee-movement.repository';
import { IReportEmployeeMovementRepository } from './repository/interface/report-employee-movement.interface';

@Injectable()
export class ReportEmployeeMovementService {
  constructor(
    @Inject(ReportEmployeeMovementRepository)
    private readonly reportEmployeeMovementRepo: IReportEmployeeMovementRepository
  ) {}

  async reportEmployeeMovement(
    pagination: PaginationReportEmployeeMovementDto
  ): Promise<ResponseReportEmployeeMovementDto> {
    const currentDate: Date = getCurrentDate().toDate();
    let inputDate: Date;
    if (pagination.date) {
      checkIsValidYearFormat(pagination.date, `${DEFAULT_DATE_FORMAT}`);
      inputDate = dayJs(pagination.date).utc(true).toDate();
    }
    const newEmployeeCount: number =
      await this.reportEmployeeMovementRepo.newEmployeeCount();

    const resignEmployeeCount: number =
      await this.reportEmployeeMovementRepo.resignEmployeeCount(
        currentDate,
        inputDate
      );
    return {
      reportId: ReportEnum.REPORT_EMPLOYEE_MOVEMENT,
      newEmployeeCount,
      resignEmployeeCount
    };
  }
}
