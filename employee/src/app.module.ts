import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AuditLogEmployeeMiddleware } from './shared-resources/common/Logger/audit-log-employee-middleware';
import { AuditSubscriber } from './shared-resources/common/subscriber/audit-subscriber';
import { RateLimitGuard } from './shared-resources/gurads/rate-limit-employee';
import { rateLimitEmployee } from './shared-resources/common/utils/rate-limit';
import { JobSchedulerLogModule } from './job-scheduler-log/job-scheduler-log.module';
import { EmployeeModule } from './employee/employee.module';
import { EmployeeWarningModule } from './employee-warning/employee-warning.module';
import { EmployeeResignationModule } from './employee-resignation/employee-resignation.module';
import { EmployeeMovementModule } from './employee-movement/employee-movement.module';
import { GrpcModule } from './grpc/grpc.module';
import { EmployeeEmergencyContactModule } from './employee-emergency-contact/employee-emergency-contact.module';
import { WorkshiftTypeModule } from './workshift-type/workshift-type.module';
import { WorkingShiftModule } from './workshift-type/working-shift/working-shift.module';
import { EmployeeEducationModule } from './employee-education/employee-education.module';
import { EmployeeIdentifierModule } from './employee-identifier/employee-identifier.module';
import { EmployeeVaccinationModule } from './employee-vaccination/employee-vaccination.module';
import { VaccinationModule } from './vaccination/vaccination.module';
import { EmployeeInsuranceModule } from './employee-insurance/employee-insurance.module';
import { GeographicModule } from './geographic/geographic.module';
import { EmployeeSkillModule } from './employee-skill/employee-skill.module';
import { EmployeeLanguageModule } from './employee-language/employee-language.module';
import { EmployeeTrainingModule } from './employee-training/employee-training.module';
import { EmployeeContactModule } from './employee-contact/employee-contact.module';
import { PositionLevelModule } from './position-level/position-level.module';
import { InsuranceModule } from './insurance/insurance.module';
import { CompanyStructureModule } from './company-structure/company-structure.module';
import { CompanyStructureComponentModule } from './company-structure/company-structure-component/company-structure-component.module';
import { EmployeePositionModule } from './employee-position/employee-position.module';
import { SelfGrpcModule } from './self-grpc/self-grpc.module';
import { CodeValueModule } from './key-value/code-value.module';
import { RedisCacheModule } from './cache/cache.module';
import { OtpModule } from './otp/otp.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { ReasonTemplateModule } from './reason-template/reason-template.module';
import { RequestApprovalWorkflowModule } from './request-approval-workflow/request-approval-workflow.module';
import { ApprovalStatusTrackingModule } from './approval-status-tracking/approval-status-tracking.module';
import { RequestWorkflowTypeModule } from './request-workflow-type/request-workflow-type.module';
import { AttendanceReportModule } from './attendance/attendance-report/attendance-report.module';
import { EmployeeWorkingScheduleModule } from './employee-working-schedule/employee-working-schedule.module';
import { MediaModule } from './media/media.module';
import { UtilityModule } from './utility/utility.module';
import { BulkImportDocumentModule } from './bulk-import-document/bulk-import-document.module';
import { FingerPrintDeviceModule } from './finger-print-device/finger-print-device.module';
import { NotificationModule } from './notification/notification.module';
import { EventsModule } from './events/events.module';
import { SalaryComponentTypeModule } from './benefit-component-type/benefit-component-type.module';
import { BenefitComponentModule } from './benefit-component/benefit-component.module';
import { PayrollDeductionTypeModule } from './payroll-deduction-type/payroll-deduction-type.module';
import { PayrollBenefitAdjustmentModule } from './payroll-benefit-adjustment/payroll-benefit-adjustment.module';
import { PayrollDeductionModule } from './payroll-deduction/payroll-deduction.module';
import { PayrollGenerationModule } from './payroll-generation/payroll-generation.module';
import { NssfModule } from './nssf/nssf.module';
import { SeniorityModule } from './seniority/seniority.module';
import { BenefitIncreasementPolicyModule } from './benefit-increasement-policy/benefit-increasement-policy.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { EmployeePaymentMethodAccountModule } from './employee-payment-method-account/employee-payment-method-account.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PayrollAdjustmentSummaryReportModule } from './payroll-adjustment-summary-report/payroll-adjustment-summary-report.module';
import { CompanyInformationModule } from './company-information/company-information.module';
import { MigrationDataModule } from './migration-data/migration-data.module';
import { ReportEmployeeMovementModule } from './report/employee/report-employee-movement/report-employee-movement.module';
import { UserDashboardCustomizationModule } from './report/user-dashboard-customization/user-dashboard-customization.module';
import { ReportTotalEmployeeModule } from './report/employee/report-total-employee/report-total-employee.module';
import { ReportAttendanceModule } from './report/attendance/report-attendance/report-attendance.module';
import { ReportEmployeePersonalInformationModule } from './report/employee/report-employee-personal-information/report-employee-personal-information.module';
import { LeaveRemainingReportModule } from './report/leave-remaining-report/leave-remaining-report.module';
import { ReportTotalEmployeeByStoreModule } from './report/employee/report-total-employee-by-store/report-total-employee-by-store.module';
import { ReportEmployeeReminderModule } from './report/employee/report-employee-reminder/report-employee-reminder.module';
import { AttendanceReminderReportModule } from './report/attendance/attendance-reminder-report/attendance-reminder-report.module';
import { EmployeeBirthdayReportModule } from './report/employee/employee-birthday-report/employee-birthday-report.module';
import { EmployeePostProbationReportModule } from './report/employee/employee-post-probation-report/employee-post-probation-report.module';
import { EmployeeWorkAnniversaryReportModule } from './report/employee/employee-work-anniversary-report/employee-work-anniversary-report.module';
import { RequestApprovalReportModule } from './report/employee/request-approval-report/request-approval-report.module';
import { PayrollCycleConfigurationModule } from './payroll-cycle-configuration/payroll-cycle-configuration.module';
import { BenefitAdjustmentTypeModule } from './benefit-adjustment-type/benefit-adjustment-type.module';
import { SalaryTaxWithheldRankModule } from './salary-tax-withheld-rank/salary-tax-withheld-rank.module';

@Module({
  imports: [
    GrpcModule,
    EmployeeModule,
    EmployeeWarningModule,
    EmployeeResignationModule,
    EmployeeMovementModule,
    VaccinationModule,
    EmployeeVaccinationModule,
    PaymentMethodModule,
    EmployeeContactModule,
    WorkshiftTypeModule,
    WorkingShiftModule,
    EmployeeEducationModule,
    EmployeeIdentifierModule,
    EmployeePaymentMethodAccountModule,
    InsuranceModule,
    EmployeeInsuranceModule,
    EmployeeEmergencyContactModule,
    EmployeeSkillModule,
    EmployeeTrainingModule,
    GeographicModule,
    PositionLevelModule,
    EmployeeLanguageModule,
    CompanyStructureModule,
    CompanyStructureComponentModule,
    EmployeePositionModule,
    CodeValueModule,
    RedisCacheModule,
    OtpModule,
    ReportTotalEmployeeModule,
    ReportAttendanceModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      subscribers: [AuditSubscriber],
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy()
    }),
    SelfGrpcModule,
    AttendanceModule,
    LeaveModule,
    ReasonTemplateModule,
    RequestWorkflowTypeModule,
    RequestApprovalWorkflowModule,
    ApprovalStatusTrackingModule,
    AttendanceReportModule,
    EmployeeWorkingScheduleModule,
    JobSchedulerLogModule,
    MediaModule,
    UtilityModule,
    FingerPrintDeviceModule,
    NotificationModule,
    BulkImportDocumentModule,
    FingerPrintDeviceModule,
    EventsModule,
    SalaryComponentTypeModule,
    BenefitComponentModule,
    PayrollDeductionTypeModule,
    PayrollDeductionModule,
    PayrollGenerationModule,
    PayrollBenefitAdjustmentModule,
    PayrollDeductionModule,
    NssfModule,
    SeniorityModule,
    BenefitIncreasementPolicyModule,
    FirebaseModule,
    CompanyInformationModule,
    ReportEmployeeMovementModule,
    ReportEmployeePersonalInformationModule,
    AttendanceReminderReportModule,
    ThrottlerModule.forRoot({
      limit: Number(process.env.RATE_LIMIT),
      ttl: Number(process.env.RATE_LIMIT_TTL),
      skipIf: rateLimitEmployee
    }),
    PayrollAdjustmentSummaryReportModule,
    ScheduleModule.forRoot(),
    UserDashboardCustomizationModule,
    ReportTotalEmployeeByStoreModule,
    MigrationDataModule,
    ReportEmployeeReminderModule,
    EmployeeBirthdayReportModule,
    EmployeePostProbationReportModule,
    EmployeeWorkAnniversaryReportModule,
    UserDashboardCustomizationModule,
    LeaveRemainingReportModule,
    RequestApprovalReportModule,
    ReportEmployeeReminderModule,
    PayrollCycleConfigurationModule,
    BenefitAdjustmentTypeModule,
    SalaryTaxWithheldRankModule
  ],
  providers: [AuditSubscriber, { provide: APP_GUARD, useClass: RateLimitGuard }]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditLogEmployeeMiddleware).forRoutes('*');
  }
}
