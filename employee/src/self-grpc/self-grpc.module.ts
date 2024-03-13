import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeService } from '../employee/employee.service';
import { PositionLevelService } from '../position-level/position-level.service';
import { ValidateEmployeeService } from '../employee/validation.service';
import { Employee } from '../employee/entity/employee.entity';
import { EmployeeWorkingScheduleModule } from '../employee-working-schedule/employee-working-schedule.module';
import { PositionLevel } from '../position-level/entities/position-level.entity';
import { WorkingShift } from '../workshift-type/entities/working-shift.entity';
import { Geographic } from '../geographic/entities/geographic.entity';
import { Code, CodeValue } from '../key-value/entity';
import { EmployeeWarning } from '../employee-warning/entities/employee-warning.entity';
import { EmployeeContact } from '../employee-contact/entities/employee-contact.entity';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { EmployeeLanguage } from '../employee-language/entities/employee-language.entity';
import { EmployeeTraining } from '../employee-training/entities/employee-training.entity';
import { EmployeeSkill } from '../employee-skill/entities/employee-skill.entity';
import { EmployeeEducation } from '../employee-education/entities/employee-education.entity';
import { EmployeeVaccination } from '../employee-vaccination/entities/employee-vaccination.entity';
import { EmployeeInsurance } from '../employee-insurance/entities/employee-insurance.entity';
import { EmployeeIdentifier } from '../employee-identifier/entities/employee-identifier.entity';
import { EmployeeEmergencyContact } from '../employee-emergency-contact/entities/employee-emergency-contact.entity';
import { Vaccination } from '../vaccination/entities/vaccination.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { AttendanceRecordService } from '../attendance/attendance-record/attendance-record.service';
import { EmployeePositionService } from '../employee-position/employee-position.service';
import { CompanyStructureComponent } from '../company-structure/company-structure-component/entities/company-structure-component.entity';
import { CompanyStructureComponentService } from '../company-structure/company-structure-component/company-structure-component.service';
import { CompanyStructureModule } from '../company-structure/company-structure.module';
import { OvertimeRequestModule } from '../attendance/overtime-request/overtime-request.module';
import { MissedScanRequestModule } from '../attendance/missed-scan-request/missed-scan-request.module';
import { BorrowOrPaybackModule } from '../attendance/borrow-or-payback/borrow-or-payback.module';
import { DayOffRequestModule } from '../leave/day-off-request/day-off-request.module';
import { LeaveRequestModule } from '../leave/leave-request/leave-request.module';
import { MissionRequestModule } from '../leave/mission-request/mission-request.module';
import { ApprovalStatus } from '../approval-status-tracking/entities/approval-status-tracking.entity';
import { WorkshiftType } from '../workshift-type/entities/workshift-type.entity';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { EmployeePaymentMethodAccount } from '../employee-payment-method-account/entities/employee-payment-method-account.entity';
import { FingerPrintDeviceModule } from '../finger-print-device/finger-print-device.module';
import { BenefitComponent } from '../benefit-component/entities/benefit-component.entity';
import { CompanyInformationModule } from '../company-information/company-information.module';
import { MediaModule } from '../media/media.module';
import { EmployeeWarningModule } from '../employee-warning/employee-warning.module';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { AttendanceRecordModule } from '../attendance/attendance-record/attendance-record.module';
import { CompanyStructureRepository } from '../company-structure/repository/company-structure.repository';
import { AttendanceReportService } from '../attendance/attendance-report/attendance-report.service';
import { AttendanceReportRepository } from '../attendance/attendance-report/repository/attendance-report.repository';
import { DayOffRequestRepository } from '../leave/day-off-request/repository/day-off-request.repository';
import { EmployeeWorkingScheduleRepository } from '../employee-working-schedule/repository/employee-working-schedule.repository';
import { OvertimeRequestRepository } from '../attendance/overtime-request/repository/overtime-request.repository';
import { PublicHolidayRepository } from '../attendance/public-holiday/repository/public-holiday.repository';
import { LeaveRequestRepository } from '../leave/leave-request/repository/leave-request.repository';
import { MissionRequestRepository } from '../leave/mission-request/repository/mission-request.repository';
import { LeaveTypeVariationRepository } from '../leave/leave-request-type/repository/leave-type-variation.repository';
import { LeaveStockRepository } from '../leave/leave-request/repository/leave-stock.repository';
import { EmployeeResignationModule } from '../employee-resignation/employee-resignation.module';
import { BenefitAdjustmentType } from '../benefit-adjustment-type/entities/benefit-adjustment-type.entity';
import { SelfGrpcService } from './self-grpc.service';
import { SelfGrpcController } from './self-grpc.controller';
import { JobSchedulerLogModule } from './../job-scheduler-log/job-scheduler-log.module';

@Module({
  controllers: [SelfGrpcController],
  imports: [
    CompanyStructureModule,
    OvertimeRequestModule,
    JobSchedulerLogModule,
    CompanyInformationModule,
    TypeOrmModule.forFeature([
      Employee,
      PositionLevel,
      WorkingShift,
      WorkshiftType,
      Geographic,
      CodeValue,
      EmployeeWarning,
      Code,
      EmployeeContact,
      PaymentMethod,
      Insurance,
      Vaccination,
      EmployeeEmergencyContact,
      EmployeeIdentifier,
      EmployeePaymentMethodAccount,
      EmployeeInsurance,
      EmployeeVaccination,
      EmployeeEducation,
      EmployeeSkill,
      EmployeeTraining,
      EmployeeLanguage,
      EmployeePosition,
      CompanyStructure,
      EmployeeWarning,
      CompanyStructureComponent,
      ApprovalStatus,
      BenefitAdjustmentType,
      BenefitComponent
    ]),
    MissedScanRequestModule,
    BorrowOrPaybackModule,
    DayOffRequestModule,
    LeaveRequestModule,
    MissionRequestModule,
    EmployeeWorkingScheduleModule,
    FingerPrintDeviceModule,
    MediaModule,
    EmployeeWarningModule,
    AttendanceRecordModule,
    EmployeeResignationModule
  ],
  providers: [
    SelfGrpcService,
    EmployeeService,
    PositionLevelService,
    ValidateEmployeeService,
    EmployeePositionService,
    CompanyStructureComponentService,
    AttendanceRecordService,
    ApprovalStatusTrackingValidationService,
    EmployeeRepository,
    CompanyStructureRepository,
    AttendanceReportService,
    AttendanceReportRepository,
    DayOffRequestRepository,
    EmployeeWorkingScheduleRepository,
    OvertimeRequestRepository,
    PublicHolidayRepository,
    LeaveRequestRepository,
    MissionRequestRepository,
    LeaveTypeVariationRepository,
    LeaveStockRepository
  ]
})
export class SelfGrpcModule {}
