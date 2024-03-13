import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { dayJs } from '../shared-resources/common/utils/date-utils';
import { EmployeeWorkingScheduleService } from '../employee-working-schedule/employee-working-schedule.service';
import { EmployeeService } from '../employee/employee.service';
import { LeaveRequestService } from '../leave/leave-request/leave-request.service';
import {
  JobSchedulerLogNameEnum,
  JobSchedulerLogTypeEnum,
  JobSchedulerLogStatusEnum
} from '../enum/job-scheduler-log.enum';
import { AttendanceReportService } from '../attendance/attendance-report/attendance-report.service';
import { GrpcService } from '../grpc/grpc.service';
import { UpdateProbationEmployeeStatusEnum } from '../employee/enum/employee-status.enum';
import { EmployeeResignationService } from '../employee-resignation/employee-resignation.service';
import { EmployeeMovementService } from '../employee-movement/employee-movement.service';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { JobSchedulerLogService } from './job-scheduler-log-service';
import { QueryJobSchedulerLogExportDto } from './dto/query-job-scheduler-log-export.dto';
import { JobSchedulerLogRepository } from './repository/job-scheduler-log.repository';
import { IJobSchedulerLogRepository } from './repository/interface/job-scheduler-log.repository.interface';

@Injectable()
export class CronService {
  private readonly JOB_SCHEDULER_LOG = 'job scheduler log';

  constructor(
    @Inject(JobSchedulerLogRepository)
    private readonly jobSchedulerLogRepo: IJobSchedulerLogRepository,
    private readonly workingScheduleService: EmployeeWorkingScheduleService,
    private readonly employeeService: EmployeeService,
    private readonly attendanceReportService: AttendanceReportService,
    private readonly jobSchedulerLogService: JobSchedulerLogService,
    private readonly leaveRequestService: LeaveRequestService,
    private readonly grpcService: GrpcService,
    private readonly employeeResignationService: EmployeeResignationService,
    private readonly employeeMovementService: EmployeeMovementService
  ) {}

  @Cron(CronExpression.EVERY_YEAR)
  async generateLeaveStock() {
    try {
      // start log
      await this.jobSchedulerLogService.startLog({
        startType: JobSchedulerLogTypeEnum.AUTO,
        jobSchedulerLogName: JobSchedulerLogNameEnum.BEGINNING_OF_YEAR
      });

      Logger.log(
        `${JobSchedulerLogNameEnum.BEGINNING_OF_YEAR}: ${JobSchedulerLogStatusEnum.RUNNING}`
      );

      await this.leaveRequestService.generateLeaveStock();

      // end log
      await this.jobSchedulerLogService.endLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.BEGINNING_OF_YEAR
      });
      Logger.log(
        `${JobSchedulerLogNameEnum.BEGINNING_OF_YEAR}: ${JobSchedulerLogStatusEnum.SUCCEED}`
      );
    } catch (error) {
      // failed log
      await this.jobSchedulerLogService.failedLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.BEGINNING_OF_YEAR
      });
      Logger.error(error);
      Logger.error(
        `${JobSchedulerLogNameEnum.BEGINNING_OF_YEAR}: ${JobSchedulerLogStatusEnum.FAILED}`
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async generateAttendanceReportByJobScheduler() {
    try {
      // start log
      await this.jobSchedulerLogService.startLog({
        startType: JobSchedulerLogTypeEnum.AUTO,
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT
      });
      Logger.log(
        `${JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT}: ${JobSchedulerLogStatusEnum.RUNNING}`
      );

      await this.attendanceReportService.generateAttendanceReportByDate(
        dayJs().add(-1, 'day').toDate()
      );

      // end log
      await this.jobSchedulerLogService.endLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT
      });
      Logger.log(
        `${JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT}: ${JobSchedulerLogStatusEnum.SUCCEED}`
      );
    } catch (error) {
      // failed log
      await this.jobSchedulerLogService.failedLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT
      });
      Logger.error(
        `${JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT}: ${JobSchedulerLogStatusEnum.FAILED}`
      );
    }
  }

  // at 12:00 AM, on day 1 of the month
  @Cron('0 0 1 * *')
  async createWorkingSchedule() {
    try {
      // start log
      await this.jobSchedulerLogService.startLog({
        startType: JobSchedulerLogTypeEnum.AUTO,
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT
      });
      Logger.log(
        `${JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT}: ${JobSchedulerLogStatusEnum.RUNNING}`
      );

      await this.workingScheduleService.generateEmployeeWorkingScheduleRecord(
        JobSchedulerLogTypeEnum.AUTO
      );

      // end log
      await this.jobSchedulerLogService.endLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT
      });
      Logger.log(
        `${JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT}: ${JobSchedulerLogStatusEnum.SUCCEED}`
      );
    } catch (error) {
      // failed log
      await this.jobSchedulerLogService.failedLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT
      });
      Logger.error(
        `${JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT}: ${JobSchedulerLogStatusEnum.FAILED}`
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async updatePayrollBenefitOfEmployee() {
    try {
      // start log
      await this.jobSchedulerLogService.startLog({
        startType: JobSchedulerLogTypeEnum.AUTO,
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_POST_PROBATION
      });
      Logger.log(
        `${JobSchedulerLogNameEnum.GENERATE_POST_PROBATION}: ${JobSchedulerLogStatusEnum.RUNNING}`
      );

      await this.employeeService.updatePostProbation({
        passProbationStatus: UpdateProbationEmployeeStatusEnum.ACTIVE
      });

      // end log
      await this.jobSchedulerLogService.endLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_POST_PROBATION
      });
      Logger.log(
        `${JobSchedulerLogNameEnum.GENERATE_POST_PROBATION}: ${JobSchedulerLogStatusEnum.SUCCEED}`
      );
    } catch (error) {
      // failed log
      await this.jobSchedulerLogService.failedLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.GENERATE_POST_PROBATION
      });
      Logger.error(
        `${JobSchedulerLogNameEnum.GENERATE_POST_PROBATION}: ${JobSchedulerLogStatusEnum.FAILED}`
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateEmployeeResignationAndMovementStatus() {
    await this.handleBODJob();
  }

  async findAll() {
    return this.jobSchedulerLogRepo.find({
      order: {
        id: 'DESC',
        description: 'DESC'
      }
    });
  }

  async exportFile(
    pagination: QueryJobSchedulerLogExportDto,
    exportFileDto: ExportFileDto
  ) {
    const data = await this.findAll();
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.SCHEDULER_JOB,
      exportFileDto,
      data
    );
  }

  async jobSchedulerLogManual(jobSchedulerLogName: string) {
    try {
      // start log
      await this.jobSchedulerLogService.startLog({
        startType: JobSchedulerLogTypeEnum.MANUAL,
        jobSchedulerLogName
      });

      // await logic
      switch (jobSchedulerLogName) {
        case JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT:
          Logger.log(
            `${JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT}: ${JobSchedulerLogStatusEnum.RUNNING}`
          );
          await this.workingScheduleService.generateEmployeeWorkingScheduleRecord(
            JobSchedulerLogTypeEnum.MANUAL
          );
          Logger.log(
            `${JobSchedulerLogNameEnum.GENERATE_WORKING_SHIFT}: ${JobSchedulerLogStatusEnum.SUCCEED}`
          );
          break;
        case JobSchedulerLogNameEnum.GENERATE_POST_PROBATION:
          Logger.log(
            `${JobSchedulerLogNameEnum.GENERATE_POST_PROBATION}: ${JobSchedulerLogStatusEnum.RUNNING}`
          );
          await this.employeeService.updatePostProbation({
            passProbationStatus: UpdateProbationEmployeeStatusEnum.ACTIVE
          });
          Logger.log(
            `${JobSchedulerLogNameEnum.GENERATE_POST_PROBATION}: ${JobSchedulerLogStatusEnum.SUCCEED}`
          );
          break;
        case JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT:
          Logger.log(
            `${JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT}: ${JobSchedulerLogStatusEnum.RUNNING}`
          );
          await this.attendanceReportService.generateAttendanceReportByDate();
          Logger.log(
            `${JobSchedulerLogNameEnum.GENERATE_ATTENDANCE_REPORT}: ${JobSchedulerLogStatusEnum.SUCCEED}`
          );
          break;
        case JobSchedulerLogNameEnum.FETCH_ATTENDANCE_RECORD:
          await this.grpcService.handleFingerPrint();
          break;
        case JobSchedulerLogNameEnum.BEGINNING_OF_YEAR:
          Logger.log(
            `${JobSchedulerLogNameEnum.BEGINNING_OF_YEAR}: ${JobSchedulerLogStatusEnum.RUNNING}`
          );
          await this.leaveRequestService.generateLeaveStock();
          Logger.log(
            `${JobSchedulerLogNameEnum.BEGINNING_OF_YEAR}: ${JobSchedulerLogStatusEnum.SUCCEED}`
          );
          break;
        case JobSchedulerLogNameEnum.BEGINNING_OF_THE_DAY: {
          // I don't use await because I want it run in background process.
          this.handleBODJob();
          break;
        }

        default:
          throw new Error(
            `unhandled ${this.JOB_SCHEDULER_LOG} value: ${jobSchedulerLogName}`
          );
      }

      // end log
      await this.jobSchedulerLogService.endLog({
        jobSchedulerLogName: jobSchedulerLogName
      });
    } catch (error) {
      // failed log
      await this.jobSchedulerLogService.failedLog({
        jobSchedulerLogName: jobSchedulerLogName
      });
      Logger.error(
        `${jobSchedulerLogName}: ${JobSchedulerLogStatusEnum.FAILED}`
      );
    }
  }

  // ==================== [Private functions block] ====================

  /**
   * Function will update employee resignation and movement status.
   */
  private async handleBODJob(): Promise<void> {
    try {
      Logger.log(
        `${JobSchedulerLogNameEnum.BEGINNING_OF_THE_DAY}: ${JobSchedulerLogStatusEnum.RUNNING}`
      );

      // handle update employee movement job
      await this.employeeMovementService.handleUpdateEmployeeMovementJob();

      // handle update employee resignation
      await this.employeeResignationService.handleUpdateEmployeeResignationJob();

      Logger.log(
        `${JobSchedulerLogNameEnum.BEGINNING_OF_THE_DAY}: ${JobSchedulerLogStatusEnum.SUCCEED}`
      );
    } catch (error) {
      // update status of cron job to failed.
      await this.jobSchedulerLogService.failedLog({
        jobSchedulerLogName: JobSchedulerLogNameEnum.BEGINNING_OF_THE_DAY
      });
      Logger.error(
        `${JobSchedulerLogNameEnum.BEGINNING_OF_THE_DAY}: ${JobSchedulerLogStatusEnum.FAILED}`
      );
    }
  }
}
