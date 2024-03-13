import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Code, CodeValue } from '../key-value/entity';
import { GeographicModule } from '../geographic/geographic.module';
import { Geographic } from '../geographic/entities/geographic.entity';
import { WorkingShift } from '../workshift-type/entities/working-shift.entity';
import { EmployeePositionModule } from '../employee-position/employee-position.module';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { Vaccination } from '../vaccination/entities/vaccination.entity';
import { FileExtensionValidationPipe } from '../media/common/validators/file-extension.validator';
import { MediaModule } from '../media/media.module';
import { UtilityModule } from '../utility/utility.module';
import { EmployeeModule } from '../employee/employee.module';
import { Employee } from '../employee/entity/employee.entity';
import { CompanyStructureModule } from '../company-structure/company-structure.module';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { EmployeeResignationModule } from '../employee-resignation/employee-resignation.module';
import { ReasonTemplateRepository } from '../reason-template/repository/reason-template.repository';
import { LeaveTypeVariationRepository } from '../leave/leave-request-type/repository/leave-type-variation.repository';
import { LeaveTypeRepository } from '../leave/leave-request-type/repository/leave-type.repository';
import { LeaveRequestModule } from '../leave/leave-request/leave-request.module';
import { DayOffRequestModule } from '../leave/day-off-request/day-off-request.module';
import { ReasonTemplateModule } from '../reason-template/reason-template.module';
import { MissedScanRequestModule } from '../attendance/missed-scan-request/missed-scan-request.module';
import { ReasonTemplate } from '../reason-template/entities/reason-template.entity';
import { EmployeeWarningModule } from '../employee-warning/employee-warning.module';
import { BulkImportEmployeeService } from './bulk-import-employee.service';
import { BulkImportDocumentController } from './bulk-import-document.controller';
import { BulkImportDocument } from './entities/bulk-import-document.entity';
import { ImportEmployeeResignationService } from './bulk-import-employee-resignation.service';
import { BulkImportBaseService } from './bulk-import-base.service';
import { BulkImportDocumentRepository } from './repository/bulk-import-document.repository';
import { BulkImportDocumentService } from './bulk-import-document.service';
import { BulkImportLeaveRequest } from './bulk-import-leave-request.service';
import { BulkImportDayOffService } from './bulk-import-dayoff.service';
import { ImportMissedScanService } from './bulk-import-missed-scan.service';
import { ImportEmployeeWarningService } from './bulk-import-employee-warning.service';

@Module({
  controllers: [BulkImportDocumentController],
  providers: [
    BulkImportDocumentService,
    BulkImportEmployeeService,
    FileExtensionValidationPipe,
    ReasonTemplateRepository,
    BulkImportBaseService,
    BulkImportDocumentRepository,
    ImportEmployeeResignationService,
    BulkImportLeaveRequest,
    LeaveTypeVariationRepository,
    LeaveTypeRepository,
    BulkImportDayOffService,
    ImportMissedScanService,
    ImportEmployeeWarningService
  ],
  imports: [
    DayOffRequestModule,
    TypeOrmModule.forFeature([
      CodeValue,
      Code,
      ReasonTemplate,
      Geographic,
      WorkingShift,
      BulkImportDocument,
      CompanyStructure,
      PaymentMethod,
      Insurance,
      Vaccination,
      Employee
    ]),
    GeographicModule,
    EmployeePositionModule,
    MediaModule,
    UtilityModule,
    EmployeeModule,
    CompanyStructureModule,
    EmployeeResignationModule,
    LeaveRequestModule,
    ReasonTemplateModule,
    MissedScanRequestModule,
    EmployeeWarningModule
  ]
})
export class BulkImportDocumentModule {}
