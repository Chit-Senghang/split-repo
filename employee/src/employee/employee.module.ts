import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code, CodeValue } from '../key-value/entity';
import { EmployeeWarning } from '../employee-warning/entities/employee-warning.entity';
import { WorkingShift } from '../workshift-type/entities/working-shift.entity';
import { Geographic } from '../geographic/entities/geographic.entity';
import { EmployeeContact } from '../employee-contact/entities/employee-contact.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { Vaccination } from '../vaccination/entities/vaccination.entity';
import { EmployeeEmergencyContact } from '../employee-emergency-contact/entities/employee-emergency-contact.entity';
import { EmployeeIdentifier } from '../employee-identifier/entities/employee-identifier.entity';
import { EmployeeInsurance } from '../employee-insurance/entities/employee-insurance.entity';
import { EmployeeVaccination } from '../employee-vaccination/entities/employee-vaccination.entity';
import { EmployeeEducation } from '../employee-education/entities/employee-education.entity';
import { EmployeeSkill } from '../employee-skill/entities/employee-skill.entity';
import { EmployeeTraining } from '../employee-training/entities/employee-training.entity';
import { EmployeeLanguage } from '../employee-language/entities/employee-language.entity';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { CompanyStructureModule } from '../company-structure/company-structure.module';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { PositionLevelService } from '../position-level/position-level.service';
import { CompanyStructureComponentService } from '../company-structure/company-structure-component/company-structure-component.service';
import { PositionLevel } from '../position-level/entities/position-level.entity';
import { CompanyStructureComponent } from '../company-structure/company-structure-component/entities/company-structure-component.entity';
import { OtpModule } from '../otp/otp.module';
import { ApprovalStatus } from '../approval-status-tracking/entities/approval-status-tracking.entity';
import { WorkshiftType } from '../workshift-type/entities/workshift-type.entity';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { EmployeePaymentMethodAccount } from '../employee-payment-method-account/entities/employee-payment-method-account.entity';
import { BenefitComponent } from '../benefit-component/entities/benefit-component.entity';
import { EmployeePositionService } from '../employee-position/employee-position.service';
import { LeaveRequestModule } from '../leave/leave-request/leave-request.module';
import { EmployeeWorkingScheduleModule } from '../employee-working-schedule/employee-working-schedule.module';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { RequestWorkflowTypeValidationService } from '../request-workflow-type/request-workflow-type.validation.service';
import { MediaModule } from '../media/media.module';
import { BenefitAdjustmentType } from '../benefit-adjustment-type/entities/benefit-adjustment-type.entity';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { ValidateEmployeeService } from './validation.service';
import { Employee } from './entity/employee.entity';
import { EmployeeRepository } from './repository/employee.repository';

@Module({
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    ValidateEmployeeService,
    PositionLevelService,
    CompanyStructureComponentService,
    EmployeePositionService,
    ApprovalStatusTrackingValidationService,
    RequestWorkflowTypeValidationService,
    EmployeeRepository
  ],
  imports: [
    CompanyStructureModule,
    TypeOrmModule.forFeature([
      Employee,
      WorkingShift,
      WorkshiftType,
      Geographic,
      CodeValue,
      PositionLevel,
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
      CompanyStructureComponent,
      ApprovalStatus,
      BenefitAdjustmentType,
      BenefitComponent
    ]),
    OtpModule,
    LeaveRequestModule,
    EmployeeWorkingScheduleModule,
    MediaModule
  ],
  exports: [
    EmployeeService,
    ValidateEmployeeService,
    PositionLevelService,
    CompanyStructureComponentService,
    EmployeeRepository
  ]
})
export class EmployeeModule {}
