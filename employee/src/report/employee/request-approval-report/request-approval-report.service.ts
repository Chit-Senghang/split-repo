import { Injectable } from '@nestjs/common';
import { ApprovalStatusTrackingPagination } from '../../../../../employee/src/approval-status-tracking/dto/pagination-approval-status-tracking.dto';
import { ApprovalStatusEnum } from '../../../../../employee/src/approval-status-tracking/common/ts/enum/approval-status.enum';
import { ApprovalStatusTrackingService } from '../../../../../employee/src/approval-status-tracking/approval-status-tracking.service';
import { DEFAULT_DATE_FORMAT } from '../../../shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDateWithFormat
} from '../../../shared-resources/common/utils/date-utils';
import { customValidateDate } from '../../../shared-resources/utils/validate-date-format';
import { ReportEnum } from '../../enums/report.enum';
import {
  ReportApprovalRequestDto,
  ReportApprovalRequestQueryDto
} from './dto/report-approval-request.dto';

@Injectable()
export class RequestApprovalReportService {
  constructor(
    private readonly approvalStatusService: ApprovalStatusTrackingService
  ) {}

  async getApprovalStatusReport({
    createdAt
  }: ReportApprovalRequestQueryDto): Promise<ReportApprovalRequestDto> {
    if (!createdAt) {
      createdAt = getCurrentDateWithFormat();
    }
    customValidateDate(createdAt);
    const fromDate = dayJs(createdAt)
      .startOf('month')
      .format(DEFAULT_DATE_FORMAT);
    const toDate = dayJs(createdAt).endOf('month').format(DEFAULT_DATE_FORMAT);
    const approvalStatusTrackings =
      await this.approvalStatusService.getApprovalWorkflowForCurrentEmployee({
        fromDate,
        toDate,
        status: ApprovalStatusEnum.PENDING
      } as ApprovalStatusTrackingPagination);

    return {
      data: {
        reportId: ReportEnum.REQUEST_APPROVAL,
        totalRequestCount: approvalStatusTrackings.totalCount
      }
    };
  }
}
