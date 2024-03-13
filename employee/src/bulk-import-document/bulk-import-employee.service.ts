import * as fs from 'fs';
import { join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  Repository
} from 'typeorm';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';
import { Validator } from 'class-validator';
import {
  convertDateTimeToGivenFormatWithNull,
  getCurrentDateTime
} from '../shared-resources/common/utils/date-utils';
import { UtilityService } from '../utility/utility.service';
import { CodeTypesEnum } from '../key-value/ts/enums/permission.enum';
import { CodeValue } from '../key-value/entity';
import { Geographic } from '../geographic/entities/geographic.entity';
import { GeographicTypeEnum } from '../database/data/geographic-type.enum';
import { WorkingShift } from '../workshift-type/entities/working-shift.entity';
import { CreateEmployeePositionImportDto } from '../employee-position/dto/create-employee-position.dto';
import { ResourceNotFoundException } from '../shared-resources/exception/resource-not-found.exception';
import { CompanyStructureTypeEnum } from '../company-structure/common/ts/enum/structure-type.enum';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { CreateEmployeeContactDto } from '../employee-contact/dto/create-employee-contact.dto';
import { CreateEmployeeEmergencyContactDto } from '../employee-emergency-contact/dto/create-employee-emergency-contact.dto';
import { Vaccination } from '../vaccination/entities/vaccination.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { CreateEmployeeInsuranceDto } from '../employee-insurance/dto/create-employee-insurance.dto';
import { CreateEmployeeVaccinationDto } from '../employee-vaccination/dto/create-employee-vaccination.dto';
import { CreateEmployeeEducationDto } from '../employee-education/dto/create-employee-education.dto';
import { EmployeeService } from '../employee/employee.service';
import { CreateEmployeeIdentifierDto } from '../employee-identifier/dto/create-employee-identifier.dto';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { CreateEmployeePaymentMethodAccountDto } from '../employee-payment-method-account/dto/create-employee-payment-method-account.dto';
import { AllEmployeeConst } from '../constant/all-employee-const';
import { TaxResponsibleEnum } from '../employee/enum/tax-responsible.enum';
import { ContractTypeEnum } from '../employee/enum/contract-type.enum';
import { EmploymentStatusEnum } from '../employee/enum/employment-status.enum';
import { CreateEmployeeDto } from '../employee/dto/create-employee.dto';
import { EmploymentTypeEnum } from '../employee/enum/employee-status.enum';
import { CodeValueResponseDto } from './dto/code-value-response.dto';
import { HEADER_STYLE } from './constant/header-style.constant';
import { GEOGRAPHIC_SELECTED_FIELDS } from './constant/geographic-selected-fields.contant';
import { WORKING_SHIFT_SELECTED_FIELDS } from './constant/working-shift-selected-fields.contant';
import { BulkTypeEnum } from './enum/type.enum';
import { RecordStatus } from './enum/record-status.enum';
import { FileName } from './enum/file-name.enum';
import { BulkImportBaseService } from './bulk-import-base.service';
import { IBulkImportDocument } from './repository/interface/bulk-import-document.interface';

interface ICreateEmployee {
  positionData: any;
  employeeContact: any;
  employeeData: any;
  identifierData: any;
  employeePaymentMethodData: any;
  contactRelationshipData: any;
  vaccinationData: any;
  insuranceData: any;
  educationData: any;
  language: any;
  skill: any;
  training: any;
}

@Injectable()
export class BulkImportEmployeeService implements IBulkImportDocument {
  readonly validator = new Validator();

  constructor(
    @InjectRepository(CodeValue)
    private readonly codeValueRepo: Repository<CodeValue>,
    @InjectRepository(Geographic)
    private readonly geographicRepo: Repository<Geographic>,
    @InjectRepository(WorkingShift)
    private readonly workingShiftRepo: Repository<WorkingShift>,
    @InjectRepository(CompanyStructure)
    private readonly companyStructureRepo: Repository<CompanyStructure>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(Vaccination)
    private readonly vaccinationRepo: Repository<Vaccination>,
    @InjectRepository(Insurance)
    private readonly insuranceRepo: Repository<Insurance>,
    private readonly utilityService: UtilityService,
    private readonly employeeService: EmployeeService,
    private readonly bulkImportBaseService: BulkImportBaseService
  ) {}

  async download(companyStructureId: number): Promise<{
    mimeType: string;
    fileName: string;
    file: string;
  }> {
    if (!companyStructureId) {
      throw new ResourceNotFoundException(
        'Company structure outlet id should not be empty.'
      );
    }
    const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();

    const companyStructure: CompanyStructure =
      await this.getOutletById(companyStructureId);

    await this.addEmployeeTemplateSheet(workbook, companyStructure);
    const fileName = 'EmployeeInformation.xlsx';

    const path: string = this.utilityService.createFilePath(
      fileName,
      'templates'
    );

    await workbook.xlsx.writeFile(path);

    const dirPath = join(path);
    const originalBuffer = fs.readFileSync(dirPath);

    const originalFile = await this.bulkImportBaseService.bufferAsMulterFile(
      originalBuffer,
      fileName
    );

    return {
      mimeType: originalFile.mimetype,
      fileName: originalFile.originalname,
      file: originalFile.buffer.toString('base64')
    };
  }

  async import(fileName: string, importStartTime: string) {
    try {
      const employeeInformation: ExcelJS.Workbook =
        await this.bulkImportBaseService.readExcel(fileName);

      const employeeWorksheet: ExcelJS.Worksheet =
        employeeInformation.getWorksheet('Employee Basic Information');

      const resultWorkbook: ExcelJS.Workbook =
        await this.bulkImportBaseService.readExcel(
          'employee-information-template.xlsx'
        );

      const path: string = this.utilityService.createFilePath(
        `${FileName.BULK_TIME_RESULT}.xlsx`,
        'templates'
      );

      const resultWorksheet = resultWorkbook.getWorksheet(1);

      resultWorksheet.name = 'Records failed information';

      let successCount = 0;
      let failureCount = 0;
      let isTheSameRecord = false;
      let totalRecord = 0;
      const rowCount = employeeWorksheet.actualRowCount;

      for (let rowNumber = 2; rowNumber <= rowCount; rowNumber++) {
        const row: any = employeeWorksheet.getRow(rowNumber);

        isTheSameRecord = false;
        for (
          let colNumber = 1;
          colNumber <= employeeWorksheet.columnCount;
          colNumber++
        ) {
          const cell: any = row.getCell(colNumber);

          if (colNumber === 1 && !cell.value) {
            isTheSameRecord = true;
          }

          if (colNumber === 1 && cell.value) {
            totalRecord += 1;
          }

          isTheSameRecord = this.loopThroughCell(
            cell,
            colNumber,
            isTheSameRecord
          );
        }

        const result = await this.checkLastRecordOrEndOfRow(
          employeeWorksheet,
          rowCount,
          rowNumber,
          resultWorksheet
        );

        successCount += result.successCount;
        failureCount += result.failureCount;
      }

      await resultWorkbook.xlsx.writeFile(path);

      const importEndDate = getCurrentDateTime();
      const isCompleted = true;
      const type = BulkTypeEnum.EMPLOYEE;

      const bulkImport = await this.bulkImportBaseService.createBulk({
        importStartTime,
        failureCount,
        successCount,
        totalRecord,
        importEndTime: importEndDate,
        isCompleted,
        type
      });

      await this.bulkImportBaseService.insertFileIntoMedia(bulkImport, path);
    } catch (error) {
      Logger.log(error);
    }
  }

  positionData = [];

  employeeContact = [];

  employeeData = [];

  identifierData = [];

  employeePaymentMethodData = [];

  contactRelationshipData = [];

  vaccinationData = [];

  insuranceData = [];

  educationData = [];

  language: string[] = [];

  skill: string[] = [];

  training: string[] = [];

  mpathStructure = [];

  structureData = [];
  // =================== [Private block] ===================

  private loopThroughCell(
    cell: any,
    colNumber: number,
    isTheSameRecord: boolean
  ) {
    if (!isTheSameRecord) {
      if (colNumber > 1 && colNumber < 32) {
        this.employeeData.push(cell.value);
      }
    }

    if (colNumber === 32 || colNumber === 33) {
      this.positionData.push(cell.value);
    }
    if (colNumber === 34 || colNumber === 35) {
      this.employeeContact.push(cell.value);
    }

    if (colNumber > 35 && colNumber < 40) {
      this.identifierData.push(cell.value);
    }

    if (colNumber === 40 || colNumber === 41) {
      this.contactRelationshipData.push(cell.value);
    }
    if (colNumber > 41 && colNumber < 45) {
      this.employeePaymentMethodData.push(cell.value);
    }

    if (colNumber === 45 || colNumber === 46) {
      this.insuranceData.push(cell.value);
    }
    if (colNumber === 47 || colNumber === 48) {
      this.vaccinationData.push(cell.value);
    }

    if (colNumber > 48 && colNumber < 54) {
      this.educationData.push(cell.value);
    }
    if (colNumber === 54) {
      this.language.push(cell.value);
    }
    if (colNumber === 55) {
      this.skill.push(cell.value);
    }
    if (colNumber === 56) {
      this.training.push(cell.value);
    }

    return isTheSameRecord;
  }

  private async checkLastRecordOrEndOfRow(
    employeeWorksheet: ExcelJS.Worksheet,
    rowCount: number,
    rowNumber: number,
    resultWorksheet: ExcelJS.Worksheet
  ) {
    let successCount = 0;
    let failureCount = 0;
    try {
      if (
        rowNumber === rowCount ||
        employeeWorksheet.getRow(rowNumber + 1).getCell(1).value !== null
      ) {
        if (this.employeeData.length) {
          const result = await this.generateDataToCreateEmployeeDto(
            {
              employeeData: this.employeeData,
              positionData: this.positionData,
              employeeContact: this.employeeContact,
              contactRelationshipData: this.contactRelationshipData,
              employeePaymentMethodData: this.employeePaymentMethodData,
              insuranceData: this.insuranceData,
              vaccinationData: this.vaccinationData,
              identifierData: this.identifierData,
              educationData: this.educationData,
              skill: this.skill,
              language: this.language,
              training: this.training
            },
            rowNumber,
            employeeWorksheet,
            resultWorksheet
          );
          successCount = result.successCount;
          failureCount = result.failureCount;

          this.positionData = [];
          this.employeeContact = [];
          this.employeeData = [];
          this.identifierData = [];
          this.employeePaymentMethodData = [];
          this.contactRelationshipData = [];
          this.vaccinationData = [];
          this.insuranceData = [];
          this.educationData = [];
          this.language = [];
          this.skill = [];
          this.training = [];
        }
      }
    } catch (error) {
      Logger.log(error);
    }

    return { successCount, failureCount };
  }

  private async generateDataToCreateEmployeeDto(
    createEmployeeData: ICreateEmployee,
    rowNumber: number,
    employeeWorksheet: ExcelJS.Worksheet,
    resultWorksheet: ExcelJS.Worksheet
  ): Promise<{ successCount; failureCount }> {
    let successCount = 0;
    let failureCount = 0;
    try {
      const createEmployeeDto: CreateEmployeeDto =
        await this.convertDataToEmployeeInformationDto(createEmployeeData);
      const entity = plainToInstance(CreateEmployeeDto, createEmployeeDto);

      await this.bulkImportBaseService.handleDtoErrorMessage(entity);
      await this.employeeService.createEmployee(createEmployeeDto, true);
      successCount++;
    } catch (error) {
      const customErrorMessage = this.bulkImportBaseService.handleError(error);
      this.addErrorMessageToWorksheet(
        employeeWorksheet,
        rowNumber,
        resultWorksheet,
        customErrorMessage
      );
      failureCount++;
    }

    return { successCount, failureCount };
  }

  private async addErrorMessageToWorksheet(
    employeeWorksheet: ExcelJS.Worksheet,
    rowNumber: number,
    resultWorksheet: ExcelJS.Worksheet,
    customErrorMessage: string
  ) {
    const failedRow = employeeWorksheet.getRow(rowNumber);
    if (!failedRow.getCell(1).value) {
      for (let i = rowNumber; i >= 1; i--) {
        const currentRow = employeeWorksheet.getRow(i);
        if (currentRow.getCell(1).value) {
          const errorRow = employeeWorksheet.getRow(i);
          errorRow.getCell(57).value = RecordStatus.FAILED;
          errorRow.getCell(58).value = customErrorMessage;

          resultWorksheet.addRow(errorRow.values);
          for (let j = i + 1; j <= employeeWorksheet.actualRowCount; j++) {
            if (!employeeWorksheet.getRow(j).getCell(1).value) {
              const errorRow = employeeWorksheet.getRow(j);
              resultWorksheet.addRow(errorRow.values);
            } else {
              break;
            }
          }
          break;
        }
      }
    } else {
      const errorRow = employeeWorksheet.getRow(rowNumber);
      errorRow.getCell(57).value = RecordStatus.FAILED;
      errorRow.getCell(58).value = customErrorMessage;

      resultWorksheet.addRow(errorRow.values);
      for (let j = rowNumber; j <= employeeWorksheet.actualRowCount; j++) {
        if (!employeeWorksheet.getRow(j).getCell(1).value) {
          const errorRow = employeeWorksheet.getRow(j);
          resultWorksheet.addRow(errorRow.values);
        } else {
          break;
        }
      }
    }
    return resultWorksheet;
  }

  private async getRecordByName<T extends ObjectLiteral>(
    repository: Repository<T>,
    optionWhere?: {
      where?: FindOptionsWhere<T>;
      relation?: FindOptionsRelations<T>;
    }
  ) {
    return await repository.findOne({
      where: optionWhere.where,
      relations: optionWhere.relation
    });
  }

  private async addEmployeeTemplateSheet(
    workbook: ExcelJS.Workbook,
    companyStructure: CompanyStructure
  ): Promise<void> {
    try {
      const employeeInformation: ExcelJS.Workbook =
        await this.bulkImportBaseService.readExcel(
          'employee-information-template.xlsx'
        );
      const employeeWorksheet: ExcelJS.Worksheet =
        employeeInformation.getWorksheet('Employee Basic Information');
      const newWorksheet: ExcelJS.Worksheet = workbook.addWorksheet(
        'Employee Basic Information'
      );

      const employmentStatus = Object.values(EmploymentTypeEnum).map(
        (item: any) => {
          return { value: item };
        }
      );

      const contractType = Object.keys(ContractTypeEnum).map((item: any) => {
        return { value: item };
      });

      const employmentType = Object.values(EmploymentTypeEnum).map(
        (item: any) => {
          return { value: item };
        }
      );

      const taxResponsibility = Object.values(TaxResponsibleEnum).map(
        (item: any) => {
          return { value: item };
        }
      );

      this.addNewSheetWithStyleOfHeader(
        workbook,
        employmentStatus,
        'Employment status info'
      );

      this.addNewSheetWithStyleOfHeader(
        workbook,
        contractType,
        'Contract type info'
      );

      this.addNewSheetWithStyleOfHeader(
        workbook,
        employmentType,
        'Employment type info'
      );

      this.addNewSheetWithStyleOfHeader(
        workbook,
        taxResponsibility,
        'Tax Responsibility info'
      );

      await this.addPositionWorksheet(workbook, companyStructure);

      await this.addWorksheetOfRelatedColumnInCodeValue(workbook);

      await this.addWorksheetOfAllGeographic(workbook);
      await this.addPaymentMethodWorksheet(workbook);

      await this.addWorkingShiftSheet(workbook);
      await this.addInsuranceWorksheet(workbook);

      await this.addVaccinationWorksheet(workbook);

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Position Information',
        'AF2',
        'G'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Working Shift Information',
        'P2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Payment Method Information',
        'AP2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Insurance Information',
        'AS2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Vaccination Information',
        'AU2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Gender Info',
        'I2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Training Information',
        'BD2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Skill Information',
        'BC2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Language Information',
        'BB2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Education Information',
        'AW2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Document Type Information',
        'AJ2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Marital Status Info',
        'T2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Spouse Information',
        'U2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Contact Relationship Info',
        'AO2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Place Of Birth Information',
        'R2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Nationality Information',
        'S2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Village Information',
        'Z2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Province Information',
        'AA2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'District or Khan Information',
        'AB2',
        'B'
      );

      this.addDataValidationFromWorksheet(
        employeeWorksheet,
        workbook,
        'Commune or Sankhat Information',
        'AC2',
        'B'
      );

      const isDefaultPosition = employeeWorksheet.getCell(`AG2`);
      const isDefaultContact = employeeWorksheet.getCell(`AI2`);
      const isDefaultAccount = employeeWorksheet.getCell(`AR2`);
      const contractCell = employeeWorksheet.getCell(`L2`);
      const employmentTypeCell = employeeWorksheet.getCell(`O2`);
      const taxResponsibilityCell = employeeWorksheet.getCell(`AD2`);
      const taxResponsibilityOptions = Object.values(TaxResponsibleEnum);
      const contractTypeOptions = Object.values(ContractTypeEnum);
      const employmentStatusOptions = Object.values(EmploymentStatusEnum);
      const employmentTypeOptions = Object.values(EmploymentTypeEnum);
      const isDefaultOptions = ['TRUE', 'FALSE'];

      const employeeStatusCell = employeeWorksheet.getCell(`D2`);

      isDefaultAccount.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${isDefaultOptions.join(',')}"`]
      };

      isDefaultContact.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${isDefaultOptions.join(',')}"`]
      };

      isDefaultPosition.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${isDefaultOptions.join(',')}"`]
      };

      taxResponsibilityCell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${taxResponsibilityOptions.join(',')}"`]
      };
      contractCell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${contractTypeOptions.join(',')}"`]
      };

      employmentTypeCell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${employmentTypeOptions.join(',')}"`]
      };

      employeeStatusCell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${employmentStatusOptions.join(',')}"`]
      };

      newWorksheet.model = employeeWorksheet.model;
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async addDataValidationFromWorksheet(
    employeeWorksheet: ExcelJS.Worksheet,
    workbook: ExcelJS.Workbook,
    sheetName: string,
    cellName: string,
    originalCellName: string
  ) {
    const cell = employeeWorksheet.getCell(`${cellName}`);
    const worksheet: ExcelJS.Worksheet = workbook.getWorksheet(`${sheetName}`);

    cell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [
        `='${sheetName}'!$${originalCellName}$2:$${originalCellName}$${worksheet.actualRowCount}`
      ]
    };
  }

  private async convertDataToEmployeeInformationDto(
    createEmployeeData: ICreateEmployee
  ): Promise<CreateEmployeeDto> {
    const employeeData = createEmployeeData.employeeData;
    try {
      if (employeeData.length > 0) {
        const workingShift: WorkingShift = await this.getRecordByName(
          this.workingShiftRepo,
          {
            where: { name: employeeData[14] }
          }
        );

        if (!workingShift) {
          throw new ResourceNotFoundException(
            'working shift',
            employeeData[14]
          );
        }
        let placeOfBirth: Geographic;
        if (employeeData[16]) {
          placeOfBirth = await this.getRecordByName(this.geographicRepo, {
            where: { nameEn: employeeData[16] }
          });
        }

        if (!placeOfBirth) {
          throw new ResourceNotFoundException(
            'place of birth',
            employeeData[16]
          );
        }

        const nationality: CodeValue = await this.getRecordByName(
          this.codeValueRepo,
          {
            where: {
              value: employeeData[17],
              codeId: { code: CodeTypesEnum.NATIONALITY }
            },
            relation: { codeId: true }
          }
        );

        if (!nationality) {
          throw new ResourceNotFoundException('nationality', employeeData[17]);
        }

        const gender: CodeValue = await this.getRecordByName(
          this.codeValueRepo,
          {
            where: {
              value: employeeData[7],
              codeId: { code: CodeTypesEnum.GENDER }
            },
            relation: { codeId: true }
          }
        );

        if (!gender) {
          throw new ResourceNotFoundException('gender', employeeData[7]);
        }
        const maritalStatus: CodeValue = await this.getRecordByName(
          this.codeValueRepo,
          {
            where: {
              value: employeeData[18],
              codeId: { code: CodeTypesEnum.MARITAL_STATUS }
            },
            relation: { codeId: true }
          }
        );
        if (!maritalStatus) {
          throw new ResourceNotFoundException(
            'marital status',
            employeeData[18]
          );
        }

        let spouse: CodeValue;
        if (employeeData[19]) {
          spouse = await this.getRecordByName(this.codeValueRepo, {
            where: {
              value: employeeData[19],
              codeId: {
                code: CodeTypesEnum.RELATIONSHIP
              }
            },
            relation: { codeId: true }
          });
        }

        let province: Geographic;
        if (employeeData[25]) {
          province = await this.getRecordByName(this.geographicRepo, {
            where: {
              nameEn: employeeData[25],
              geographicType: GeographicTypeEnum.PROVINCE
            }
          });
        }

        let district: Geographic;
        if (employeeData[26]) {
          district = await this.getRecordByName(this.geographicRepo, {
            where: {
              nameEn: employeeData[26],
              geographicType: GeographicTypeEnum.DISTRICT
            }
          });
        }

        let village: Geographic;
        if (employeeData[24]) {
          village = await this.getRecordByName(this.geographicRepo, {
            where: {
              nameEn: employeeData[24],
              geographicType: GeographicTypeEnum.VILLAGE
            }
          });
        }

        let commune: Geographic;
        if (employeeData[27]) {
          commune = await this.getRecordByName(this.geographicRepo, {
            where: {
              nameEn: employeeData[27],
              geographicType: GeographicTypeEnum.COMMUNE
            }
          });
        }

        const startDate = convertDateTimeToGivenFormatWithNull(employeeData[8]);
        const postProbationDate = convertDateTimeToGivenFormatWithNull(
          employeeData[9]
        );
        const contractPeriodStartDate = convertDateTimeToGivenFormatWithNull(
          employeeData[11]
        );

        const contractPeriodEndDate = convertDateTimeToGivenFormatWithNull(
          employeeData[12]
        );

        const dob = convertDateTimeToGivenFormatWithNull(employeeData[15]);
        const positions: CreateEmployeePositionImportDto[] =
          await this.convertDataToEmployeePositionDto(
            createEmployeeData.positionData
          );

        const contacts: CreateEmployeeContactDto[] =
          await this.convertDataToEmployeeContact(
            createEmployeeData.employeeContact
          );

        const emergencyContacts: CreateEmployeeEmergencyContactDto[] =
          await this.convertDataToEmployeeEmergencyContactDto(
            createEmployeeData.contactRelationshipData
          );

        const paymentMethodAccounts: CreateEmployeePaymentMethodAccountDto[] =
          await this.convertDataToEmployeePaymentMethodAccountDto(
            createEmployeeData.employeePaymentMethodData
          );

        const identifiers: CreateEmployeeIdentifierDto[] =
          await this.convertDataToEmployeeIdentifierDto(
            createEmployeeData.identifierData
          );
        const insuranceCards: CreateEmployeeInsuranceDto[] =
          await this.convertDataToEmployeeInsuranceDto(
            createEmployeeData.insuranceData
          );

        const vaccinationCards: CreateEmployeeVaccinationDto[] =
          await this.convertDataToEmployeeVaccinationDto(
            createEmployeeData.vaccinationData
          );

        const educations: CreateEmployeeEducationDto[] =
          await this.convertDataToEmployeeEducationDto(
            createEmployeeData.educationData
          );
        const skills: number[] =
          await this.convertDataToEmployeeSkillOrTrainingOrLanguage(
            createEmployeeData.skill,
            CodeTypesEnum.SKILL
          );

        const trainings: number[] =
          await this.convertDataToEmployeeSkillOrTrainingOrLanguage(
            createEmployeeData.training,
            CodeTypesEnum.TRAINING
          );

        const languages: number[] =
          await this.convertDataToEmployeeSkillOrTrainingOrLanguage(
            createEmployeeData.language,
            CodeTypesEnum.LANGUAGE
          );

        const employeeInformation: CreateEmployeeDto = {
          accountNo: employeeData[0]?.toString(),
          fingerPrintId: employeeData[1]?.toString(),
          employmentStatus: employeeData[2],
          firstNameEn: employeeData[3],
          lastNameEn: employeeData[4],
          firstNameKh: employeeData[5],
          lastNameKh: employeeData[6],
          genderId: gender.id,
          startDate,
          postProbationDate: postProbationDate,
          contractType: employeeData[10],
          contractPeriodStartDate,
          contractPeriodEndDate,
          employmentType: employeeData[13],
          workingShiftId: workingShift.id,
          dob,
          placeOfBirthId: placeOfBirth.id || null,
          nationality: nationality.id,
          maritalStatusId: maritalStatus.id,
          spouseId: spouse ? spouse.id : null,
          spouseOccupation: employeeData[20],
          numberOfChildren: employeeData[21],
          addressHomeNumber: employeeData[22] ? String(employeeData[22]) : null,
          addressStreetNumber: employeeData[23]
            ? String(employeeData[23])
            : null,
          addressVillageId: village ? village.id : null,
          addressProvinceId: province ? province.id : null,
          addressDistrictId: district ? district.id : null,
          addressCommuneId: commune ? commune.id : null,
          taxResponsible: employeeData[28],
          email: employeeData[29]?.text || employeeData[29],
          contacts,
          emergencyContacts,
          identifiers,
          paymentMethodAccounts,
          insuranceCards,
          vaccinationCards,
          educations,
          skills,
          trainings,
          languages,
          positions
        };

        return employeeInformation;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeeSkillOrTrainingOrLanguage(
    employeeData: any,
    type: CodeTypesEnum
  ): Promise<number[]> {
    try {
      if (employeeData.length) {
        const data = await Promise.all(
          employeeData.map(async (item: string) => {
            if (item) {
              const codeValue: CodeValue = await this.getRecordByName(
                this.codeValueRepo,
                {
                  where: {
                    value: item,
                    codeId: { code: type }
                  },
                  relation: { codeId: true }
                }
              );

              if (!codeValue) {
                throw new ResourceNotFoundException('code value', item);
              }
              return codeValue.id;
            }
          })
        );
        return data.filter((item: any) => {
          if (item) {
            return item;
          }
        });
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeeEducationDto(employeeEducationData: any) {
    try {
      if (employeeEducationData.length > 0) {
        const employeeEducationDto: CreateEmployeeEducationDto[] = [];
        for (let i = 0; i < employeeEducationData.length; i += 5) {
          if (employeeEducationData[i]) {
            const educationType: CodeValue = await this.getRecordByName(
              this.codeValueRepo,
              {
                where: { value: employeeEducationData[i] }
              }
            );
            if (!educationType) {
              throw new ResourceNotFoundException(
                'education type',
                employeeEducationData[i]
              );
            }
            const startDate: any = convertDateTimeToGivenFormatWithNull(
              employeeEducationData[i + 3]
            );

            const endDate: any = convertDateTimeToGivenFormatWithNull(
              employeeEducationData[i + 4]
            );

            employeeEducationDto.push({
              educationTypeId: educationType.id,
              instituteName: employeeEducationData[i + 1],
              major: employeeEducationData[i + 2],
              startDate,
              endDate
            });
          }
        }
        return employeeEducationDto;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeeVaccinationDto(
    employeeVaccinationData: any
  ): Promise<CreateEmployeeVaccinationDto[]> {
    try {
      if (employeeVaccinationData.length > 0) {
        const employeeVaccinationDto: CreateEmployeeVaccinationDto[] = [];
        for (let i = 0; i < employeeVaccinationData.length; i += 2) {
          if (employeeVaccinationData[i]) {
            const vaccination = await this.getRecordByName(
              this.vaccinationRepo,
              {
                where: { name: employeeVaccinationData[i] }
              }
            );
            if (!vaccination) {
              throw new ResourceNotFoundException(
                'vaccination',
                employeeVaccinationData[i]
              );
            }
            employeeVaccinationDto.push({
              vaccinationId: vaccination.id,
              cardNumber: employeeVaccinationData[i + 1]?.toString() || ''
            });
          }
        }

        return employeeVaccinationDto;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeeInsuranceDto(
    insuranceData: any
  ): Promise<CreateEmployeeInsuranceDto[]> {
    try {
      if (insuranceData.length > 0) {
        const employeeInsuranceDto: CreateEmployeeInsuranceDto[] = [];
        for (let i = 0; i < insuranceData.length; i += 2) {
          if (insuranceData[i]) {
            const insurance = await this.getRecordByName(this.insuranceRepo, {
              where: { name: insuranceData[i] }
            });
            if (!insurance) {
              throw new ResourceNotFoundException(
                'insurance',
                insuranceData[i]
              );
            }
            employeeInsuranceDto.push({
              insuranceId: insurance.id,
              cardNumber: insuranceData[i + 1]?.toString() || ''
            });
            return employeeInsuranceDto;
          }
        }
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeeIdentifierDto(
    identifierData: any
  ): Promise<CreateEmployeeIdentifierDto[]> {
    try {
      if (identifierData.length > 0) {
        const employeeIdentifierDto: CreateEmployeeIdentifierDto[] = [];
        for (let i = 0; i < identifierData.length; i += 4) {
          if (identifierData[i] && identifierData[i + 1]) {
            const documentType: CodeValue = await this.getRecordByName(
              this.codeValueRepo,
              {
                where: { value: identifierData[i] }
              }
            );

            if (!documentType) {
              throw new ResourceNotFoundException(
                'document type',
                identifierData[i]
              );
            }
            const expireDate: any = convertDateTimeToGivenFormatWithNull(
              identifierData[i + 2]
            );

            employeeIdentifierDto.push({
              documentTypeId: documentType.id,
              documentIdentifier: identifierData[i + 1]?.toString() || '',
              expireDate,
              description: identifierData[i + 3] || null
            });
          }
        }
        return employeeIdentifierDto;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeeEmergencyContactDto(
    employeeEmergencyContactData: any
  ): Promise<CreateEmployeeEmergencyContactDto[]> {
    try {
      if (employeeEmergencyContactData.length > 0) {
        const employeeEmergencyContactDto: CreateEmployeeEmergencyContactDto[] =
          [];
        for (let i = 0; i < employeeEmergencyContactData.length; i += 2) {
          if (employeeEmergencyContactData[i + 1]) {
            const emergencyContact: CodeValue = await this.getRecordByName(
              this.codeValueRepo,
              { where: { value: employeeEmergencyContactData[i + 1] } }
            );

            if (!emergencyContact) {
              throw new ResourceNotFoundException(
                'emergency contact',
                employeeEmergencyContactData[i + 1]
              );
            }

            employeeEmergencyContactDto.push({
              contact: employeeEmergencyContactData[i],
              contactRelationshipId: emergencyContact.id
            });
          }
        }

        return employeeEmergencyContactDto;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeeContact(
    employeeContactData: any
  ): Promise<CreateEmployeeContactDto[]> {
    try {
      const employeeContactDto: CreateEmployeeContactDto[] = [];
      if (employeeContactData.length > 0) {
        for (let i = 0; i < employeeContactData.length; i += 2) {
          if (employeeContactData[i + 1] && employeeContactData[i]) {
            employeeContactDto.push({
              isDefault: Boolean(employeeContactData[i + 1]),
              contact: employeeContactData[i]
            });
          }
        }
        return employeeContactDto;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeePaymentMethodAccountDto(
    paymentMethodAccountData: any
  ): Promise<CreateEmployeePaymentMethodAccountDto[]> {
    try {
      const employeePaymentMethodAccounts: CreateEmployeePaymentMethodAccountDto[] =
        [];

      if (paymentMethodAccountData.length > 0) {
        for (let i = 0; i < paymentMethodAccountData.length; i += 3) {
          if (paymentMethodAccountData[i]) {
            const paymentMethod = await this.getRecordByName(
              this.paymentMethodRepo,
              {
                where: { name: paymentMethodAccountData[i] }
              }
            );
            if (!paymentMethod) {
              throw new ResourceNotFoundException(
                AllEmployeeConst.PAYMENT_METHOD,
                paymentMethodAccountData[i]
              );
            }

            employeePaymentMethodAccounts.push({
              paymentMethodId: paymentMethod.id,
              accountNumber: paymentMethodAccountData[i + 1]?.toString() || '',
              isDefaultAccount: Boolean(paymentMethodAccountData[i + 2])
            });
          }
        }

        return employeePaymentMethodAccounts;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async convertDataToEmployeePositionDto(
    positionData: any
  ): Promise<CreateEmployeePositionImportDto[]> {
    try {
      const employeePositions: CreateEmployeePositionImportDto[] = [];
      if (positionData.length > 0) {
        for (let i = 0; i < positionData.length; i += 2) {
          if (positionData[i]) {
            const positionId = positionData[i].split('-')[0];
            if (isNaN(Number(positionId))) {
              throw new ResourceNotFoundException(
                'Resource of employee position not found.'
              );
            }

            const position = await this.companyStructureRepo.findOne({
              where: { id: Number(positionId) }
            });

            if (!position) {
              throw new ResourceNotFoundException('position', positionData[i]);
            }

            employeePositions.push({
              positionId: position.id,
              isDefaultPosition: Boolean(positionData[i + 1])
            });
          }
        }
      }
      return employeePositions;
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async getOutletById(id: number): Promise<CompanyStructure> {
    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: {
          id: id,
          companyStructureComponent: { type: CompanyStructureTypeEnum.OUTLET }
        },
        relations: {
          companyStructureComponent: true,
          parentId: {
            companyStructureComponent: true,
            parentId: { companyStructureComponent: true }
          }
        },
        select: {
          id: true,
          companyStructureComponent: { id: true, name: true, type: true },
          parentId: {
            id: true,
            companyStructureComponent: { id: true, name: true, type: true },
            parentId: {
              id: true,
              companyStructureComponent: { id: true, name: true, type: true }
            }
          }
        }
      });

    if (!companyStructure) {
      throw new ResourceNotFoundException('company structure', id);
    }
    return companyStructure;
  }

  private async addPositionWorksheet(
    workbook: ExcelJS.Workbook,
    companyStructure: CompanyStructure
  ) {
    try {
      const companyStructureData = [];
      const companyStructures: CompanyStructure[] =
        await this.companyStructureRepo.find({
          where: {
            parentId: {
              id: companyStructure.id
            }
          },
          relations: {
            companyStructureComponent: true,
            parentId: { companyStructureComponent: true }
          },
          select: {
            id: true,
            companyStructureComponent: { id: true, name: true },
            parentId: { id: true }
          }
        });

      for (const department of companyStructures) {
        const teams = await this.getTeamsOrPositionInDepartment(
          department.id,
          [],
          CompanyStructureTypeEnum.TEAM
        );
        if (teams.length) {
          for (const team of teams) {
            const positions = await this.getTeamsOrPositionInDepartment(
              team.id,
              [],
              CompanyStructureTypeEnum.POSITION
            );

            if (positions.length) {
              for (const position of positions) {
                companyStructureData.push({
                  id: position.id,
                  company:
                    companyStructure.parentId.parentId.companyStructureComponent
                      .name,
                  location:
                    companyStructure.parentId.companyStructureComponent.name,
                  store: companyStructure.companyStructureComponent.name,
                  department: department.companyStructureComponent.name,
                  division: team.companyStructureComponent.name,
                  position:
                    position.id + '-' + position.companyStructureComponent.name
                });
              }
            }
          }
        }
      }

      if (!companyStructureData.length) {
        throw new ResourceNotFoundException(
          'No positions found in this store.'
        );
      }

      if (companyStructureData.length) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          companyStructureData,
          'Position Information'
        );
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async getTeamsOrPositionInDepartment(
    id: number,
    data: CompanyStructure[],
    type: CompanyStructureTypeEnum
  ) {
    const companyStructures: CompanyStructure[] =
      await this.getCompanyStructureById(id, type);

    if (!companyStructures.length) {
      return data;
    }

    for (const companyStructure of companyStructures) {
      data.push(companyStructure);
      await this.getTeamsOrPositionInDepartment(
        companyStructure.id,
        data,
        type
      );
    }

    return data;
  }

  private async getCompanyStructureById(
    id: number,
    type: CompanyStructureTypeEnum
  ): Promise<CompanyStructure[]> {
    return await this.companyStructureRepo.find({
      where: {
        parentId: { id },
        companyStructureComponent: {
          type
        }
      },
      relations: {
        companyStructureComponent: true,
        parentId: true
      },
      select: {
        id: true,
        companyStructureComponent: { id: true, name: true, type: true },
        parentId: {
          id: true
        }
      }
    });
  }

  private async addPaymentMethodWorksheet(workbook: ExcelJS.Workbook) {
    try {
      const paymentMethods: PaymentMethod[] = await this.paymentMethodRepo.find(
        {
          select: { id: true, name: true }
        }
      );

      if (paymentMethods.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          paymentMethods,
          `Payment Method Information`
        );
        return paymentMethods;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async addInsuranceWorksheet(workbook: ExcelJS.Workbook) {
    try {
      const insurances: Insurance[] = await this.insuranceRepo.find({
        select: { id: true, name: true }
      });

      if (insurances.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          insurances,
          'Insurance Information'
        );
        return insurances;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async addVaccinationWorksheet(workbook: ExcelJS.Workbook) {
    try {
      const vaccinations: Vaccination[] = await this.vaccinationRepo.find({
        select: { id: true, name: true }
      });

      if (vaccinations.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          vaccinations,
          'Vaccination Information'
        );
        return vaccinations;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async addWorksheetOfRelatedColumnInCodeValue(
    workbook: ExcelJS.Workbook
  ) {
    try {
      const contactRelationships: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.RELATIONSHIP
        );

      if (contactRelationships.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          contactRelationships,
          'Contact Relationship Info'
        );

        this.addNewSheetWithStyleOfHeader(
          workbook,
          contactRelationships,
          'Spouse Information'
        );
      }

      const maritalStatus: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.MARITAL_STATUS
        );

      if (maritalStatus.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          maritalStatus,
          'Marital Status Info'
        );
      }

      const genders: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.GENDER
        );

      if (genders.length > 0) {
        this.addNewSheetWithStyleOfHeader(workbook, genders, 'Gender Info');
      }

      const documentTypeInformation: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.DOCUMENT_TYPE
        );

      if (documentTypeInformation.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          documentTypeInformation,
          'Document Type Information'
        );
      }

      const educationTypes: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.EDUCATION_TYPE
        );

      if (educationTypes.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          educationTypes,
          'Education Information'
        );
      }

      const nationalities: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.NATIONALITY
        );

      if (nationalities.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          nationalities,
          'Nationality Information'
        );
      }

      const skills: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.SKILL
        );

      if (skills.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          skills,
          'Skill Information'
        );
      }

      const trainings: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.TRAINING
        );

      if (trainings.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          trainings,
          'Training Information'
        );
      }

      const languages: CodeValueResponseDto[] =
        await this.bulkImportBaseService.getCodeValueBaseOnType(
          CodeTypesEnum.LANGUAGE
        );

      if (languages.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          languages,
          'Language Information'
        );
      }

      return {
        languages,
        trainings,
        skills,
        nationalities,
        contactRelationships,
        educationTypes,
        documentTypeInformation,
        genders,
        maritalStatus
      };
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async addWorksheetOfAllGeographic(
    workbook: ExcelJS.Workbook
  ): Promise<void> {
    try {
      const provinces: Geographic[] = await this.getGeographicByType(
        GeographicTypeEnum.PROVINCE
      );

      if (provinces.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          provinces,
          'Province Information'
        );
        this.addNewSheetWithStyleOfHeader(
          workbook,
          provinces,
          'Place Of Birth Information'
        );
      }

      const districts: Geographic[] = await this.getGeographicByType(
        GeographicTypeEnum.DISTRICT
      );

      if (districts.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          districts,
          'District or Khan Information'
        );
      }

      const communes: Geographic[] = await this.getGeographicByType(
        GeographicTypeEnum.COMMUNE
      );

      if (communes.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          communes,
          'Commune or Sankhat Information'
        );
      }

      const villages: Geographic[] = await this.getGeographicByType(
        GeographicTypeEnum.VILLAGE
      );

      if (villages.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          villages,
          'Village Information'
        );
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async addWorkingShiftSheet(
    workbook: ExcelJS.Workbook
  ): Promise<WorkingShift[]> {
    try {
      const result: WorkingShift[] = await this.workingShiftRepo.find({
        relations: { workshiftType: true },
        select: WORKING_SHIFT_SELECTED_FIELDS
      });
      const workingShifts = result.map((workingShift: WorkingShift) => {
        const workingShiftType = workingShift.workshiftType;
        delete workingShift.workshiftType;
        return {
          ...workingShift,
          workingShiftType: workingShiftType.name
        };
      });

      if (workingShifts.length > 0) {
        this.addNewSheetWithStyleOfHeader(
          workbook,
          workingShifts,
          'Working Shift Information'
        );
        return workingShifts;
      }
    } catch (error) {
      Logger.log(error);
      throw error;
    }
  }

  private async getGeographicByType(
    type: GeographicTypeEnum = GeographicTypeEnum.VILLAGE
  ): Promise<Geographic[]> {
    const geographics: Geographic[] = await this.geographicRepo.find({
      where: { geographicType: type },
      relations: { parentId: true },
      select: GEOGRAPHIC_SELECTED_FIELDS
    });

    return geographics.map((geographic: Geographic) => {
      if (geographic.parentId) {
        const parent = geographic.parentId;
        delete geographic.parentId;
        return {
          ...geographic,
          parentNameEn: parent.nameEn,
          parentNameKh: parent.nameKh
        };
      } else {
        delete geographic.parentId;
        return geographic;
      }
    });
  }

  private getObjectValues(obj: any): any[] {
    return Object.values(obj);
  }

  private addNewSheetWithStyleOfHeader(
    workbook: ExcelJS.Workbook,
    data: any,
    worksheetName: string
  ): void {
    const worksheet = workbook.addWorksheet(worksheetName);

    let headers = Object.keys(data[0]);
    headers = headers.map((header: string) => {
      return header.charAt(0).toUpperCase() + header.slice(1);
    });
    worksheet.addRow(headers);

    data.map((item: any) => {
      const values = this.getObjectValues(item);
      worksheet.addRow(values);
    });

    worksheet.columns.forEach((column) => {
      column.width = 30;
      column.alignment = HEADER_STYLE.alignment;
      column.font = HEADER_STYLE.font;
    });

    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell) => {
      cell.style = HEADER_STYLE;
    });
  }
}
