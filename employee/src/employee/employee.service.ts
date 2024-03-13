import {
  DataSource,
  FindOperator,
  FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  Not,
  QueryRunner,
  Raw,
  Repository
} from 'typeorm';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import {
  convertDateTimeToGivenFormat,
  dayJs,
  getCurrentDate,
  getCurrentDateWithFormat
} from '../shared-resources/common/utils/date-utils';
import { checkDefaultPosition } from '../shared-resources/utils/check-default-position.utils';
import { CodeTypesEnum } from '../key-value/ts/enums/permission.enum';
import { EmployeeContact } from '../employee-contact/entities/employee-contact.entity';
import { EmployeeEmergencyContact } from '../employee-emergency-contact/entities/employee-emergency-contact.entity';
import { EmployeeIdentifier } from '../employee-identifier/entities/employee-identifier.entity';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { EmployeeInsurance } from '../employee-insurance/entities/employee-insurance.entity';
import { EmployeeVaccination } from '../employee-vaccination/entities/employee-vaccination.entity';
import { EmployeeEducation } from '../employee-education/entities/employee-education.entity';
import { EmployeeLanguage } from '../employee-language/entities/employee-language.entity';
import { EmployeeTraining } from '../employee-training/entities/employee-training.entity';
import { EmployeeSkill } from '../employee-skill/entities/employee-skill.entity';
import { removeUnnecessaryProps } from '../../../auth/src/common/helper/delete-fields-helper';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { CompanyStructure } from '../company-structure/entities/company-structure.entity';
import { CompanyStructureTypeEnum } from '../company-structure/common/ts/enum/structure-type.enum';
import { GrpcService } from '../grpc/grpc.service';
import {
  checkIsValidYearFormat,
  validateDateTime
} from '../shared-resources/utils/validate-date-format';
import { EmployeeProto } from '../shared-resources/proto';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { Geographic } from '../geographic/entities/geographic.entity';
import { GeographicTypeEnum } from '../database/data/geographic-type.enum';
import { CodeValue } from '../key-value/entity';
import { WorkingShift } from '../workshift-type/entities/working-shift.entity';
import { MailService } from '../otp/mail.service';
import { EntityParam } from '../shared-resources/ts/interface/entity-params';
import { RequestWorkFlowTypeEnum } from '../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { UtilityService } from '../utility/utility.service';
import { MediaService } from '../media/media.service';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { CreateEmployeeInsuranceDto } from '../employee-insurance/dto/create-employee-insurance.dto';
import { CreateEmployeeIdentifierDto } from '../employee-identifier/dto/create-employee-identifier.dto';
import { CreateEmployeeVaccinationDto } from '../employee-vaccination/dto/create-employee-vaccination.dto';
import { CreateEmployeeEducationDto } from '../employee-education/dto/create-employee-education.dto';
import {
  CreateEmployeePositionDto,
  CreateEmployeePositionImportDto
} from '../employee-position/dto/create-employee-position.dto';
import { CreateEmployeeEmergencyContactDto } from '../employee-emergency-contact/dto/create-employee-emergency-contact.dto';
import { CreateEmployeeContactDto } from '../employee-contact/dto/create-employee-contact.dto';
import { WorkshiftType } from '../workshift-type/entities/workshift-type.entity';
import { WorkShiftTypeEnum } from '../workshift-type/common/ts/enum/workshift-type.enum';
import { CreateApprovalStatusTrackingDto } from '../approval-status-tracking/dto/create-approval-status-tracking.dto';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { EmployeePaymentMethodAccount } from '../employee-payment-method-account/entities/employee-payment-method-account.entity';
import { CreateEmployeePaymentMethodAccountDto } from '../employee-payment-method-account/dto/create-employee-payment-method-account.dto';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { getBackofficeResetUrl as getBackOfficeResetUrl } from '../shared-resources/utils/domain-resolver';
import { BenefitIncreasementPolicyDetail } from '../benefit-increasement-policy/entities/benefit-increasement-policy-detail.entity';
import { BenefitComponent } from '../benefit-component/entities/benefit-component.entity';
import { PayrollBenefitAdjustment } from '../payroll-benefit-adjustment/entities/payroll-benefit-adjustment.entity';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_MONTH_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../shared-resources/common/dto/default-date-format';
import { StatusEnum } from '../shared-resources/common/enums/status.enum';
import { PayrollBenefitAdjustmentDetail } from '../payroll-benefit-adjustment/entities/payroll-benefit-adjustment-detail.entity';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { Vaccination } from '../vaccination/entities/vaccination.entity';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { ApprovalStatus } from '../approval-status-tracking/entities/approval-status-tracking.entity';
import { WorkflowTypeEnum } from '../shared-resources/common/enum/workflow-type.enum';
import { EmployeePositionService } from '../employee-position/employee-position.service';
import { LeaveRequestService } from '../leave/leave-request/leave-request.service';
import { EmployeeWorkingScheduleService } from '../employee-working-schedule/employee-working-schedule.service';
import { RequestWorkFlowType } from '../request-workflow-type/entities/request-workflow-type.entity';
import { RequestWorkflowTypeValidationService } from '../request-workflow-type/request-workflow-type.validation.service';
import { ApprovalStatusTrackingValidationService } from '../approval-status-tracking/approval-status-tracking-validation.service';
import { JobSchedulerLogTypeEnum } from '../enum/job-scheduler-log.enum';
import { ApprovalStatusEnum } from '../approval-status-tracking/common/ts/enum/approval-status.enum';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { BenefitAdjustmentType } from '../benefit-adjustment-type/entities/benefit-adjustment-type.entity';
import { employeeConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { EMPLOYEE_RELATIONSHIP } from './constant/relationship.constant';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ValidateEmployeeService } from './validation.service';
import { EmployeeMasterInformationPagination } from './dto/employee-pagination.dto';
import { Employee, employeeSearchableColumns } from './entity/employee.entity';
import {
  UpdateEmployeeDto,
  UpdatePostProbation
} from './dto/update-employee.dto';
import { CurrentEmployeeDto } from './dto/current-employee-dto';
import {
  EmployeeStatusEnum,
  UpdateProbationEmployeeStatusEnum
} from './enum/employee-status.enum';
import {
  EmployeeUniquePagination,
  UNIQUE_COLUMN
} from './dto/employee-employee-unique';
import { EMPLOYEE_SELECTED_FIELDS } from './constant/selected-fields.constant';
import {
  EMPLOYEE_RELATIONSHIP_FOR_CREATE_AND_UPDATE,
  EMPLOYEE_SELECTED_FIELDS_FOR_UPDATE_AND_CREATE
} from './constant/update-employee-selected-fields.constant';
import { EmployeeRepository } from './repository/employee.repository';
import { IEmployeeRepository } from './repository/interface/employee.repository.interface';

@Injectable()
export class EmployeeService {
  private readonly EMPLOYEE = 'employee';

  private readonly ACCOUNT_PREFIX_NAME = 'employee-account-no-prefix';

  private readonly COMPANY_STRUCTURE_POSITION = 'company structure position';

  private readonly ADJUSTMENT_TYPE = 'Pass probation';

  constructor(
    private readonly validateEmployeeService: ValidateEmployeeService,
    private readonly dataSource: DataSource,
    @InjectRepository(EmployeeContact)
    private readonly employeeContactRepo: Repository<EmployeeContact>,
    @InjectRepository(EmployeeEmergencyContact)
    private readonly employeeEmergencyContactRepo: Repository<EmployeeEmergencyContact>,
    @InjectRepository(EmployeeIdentifier)
    private readonly employeeIdentifierRepo: Repository<EmployeeIdentifier>,
    @InjectRepository(EmployeePaymentMethodAccount)
    private readonly employeePaymentMethodAccountRepo: Repository<EmployeePaymentMethodAccount>,
    @InjectRepository(EmployeeInsurance)
    private readonly employeeInsuranceRepo: Repository<EmployeeInsurance>,
    @InjectRepository(EmployeeVaccination)
    private readonly employeeVaccinationRepo: Repository<EmployeeVaccination>,
    @InjectRepository(EmployeeEducation)
    private readonly employeeEducationRepo: Repository<EmployeeEducation>,
    @InjectRepository(EmployeeLanguage)
    private readonly employeeLanguageRepo: Repository<EmployeeLanguage>,
    @InjectRepository(EmployeeTraining)
    private readonly employeeTrainingRepo: Repository<EmployeeTraining>,
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepo: Repository<EmployeeSkill>,
    @InjectRepository(EmployeePosition)
    private readonly employeePositionRepo: Repository<EmployeePosition>,
    @InjectRepository(CompanyStructure)
    private readonly companyStructureRepo: Repository<CompanyStructure>,
    @InjectRepository(Geographic)
    private readonly geographicRepo: Repository<Geographic>,
    @InjectRepository(CodeValue)
    private readonly codeValueRepository: Repository<CodeValue>,
    @InjectRepository(WorkingShift)
    private readonly workingShiftRepo: Repository<WorkingShift>,
    private readonly grpcService: GrpcService,
    private readonly mailService: MailService,
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService,
    @InjectRepository(WorkshiftType)
    private readonly workshiftTypeRepository: Repository<WorkshiftType>,
    @InjectRepository(BenefitAdjustmentType)
    private readonly adjustmentTypeRepo: Repository<BenefitAdjustmentType>,
    @InjectRepository(BenefitComponent)
    private readonly benefitComponentRepo: Repository<BenefitComponent>,
    private readonly employeePositionService: EmployeePositionService,
    private readonly leaveRequestService: LeaveRequestService,
    private readonly employeeWorkingScheduleService: EmployeeWorkingScheduleService,
    private readonly requestWorkflowTypeValidationService: RequestWorkflowTypeValidationService,
    private readonly approvalStatusValidationValidationService: ApprovalStatusTrackingValidationService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  async exportFile(
    pagination: EmployeeMasterInformationPagination,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.EMPLOYEE_MASTER_INFORMATION,
      exportFileDto,
      data
    );
  }

  async attachUserToEmployee(employeeId: number, userId: number) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,
        positions: {
          isMoved: false
        }
      }
    });
    if (!employee) {
      throw new ResourceNotFoundException('Employee', employeeId);
    }
    return await this.employeeRepo.save(Object.assign(employee, { userId }));
  }

  async createEmployee(
    createEmployeeDto: CreateEmployeeDto | UpdateEmployeeDto,
    isImported?: boolean
  ) {
    await this.validateEmployeeService.checkValidationWithDifferentTables(
      createEmployeeDto
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let postProbationDate: any,
        resignDate: any,
        contractPeriodEndDate: any,
        contractPeriodStartDate: any,
        startDate: any,
        dob: any;
      if (!isImported) {
        startDate = validateDateTime(createEmployeeDto.startDate);

        if (createEmployeeDto.postProbationDate) {
          postProbationDate = validateDateTime(
            createEmployeeDto.postProbationDate
          );
        }

        if (createEmployeeDto.resignDate) {
          resignDate = validateDateTime(createEmployeeDto.resignDate);
        }

        if (createEmployeeDto.contractPeriodEndDate) {
          contractPeriodEndDate = validateDateTime(
            createEmployeeDto.contractPeriodEndDate
          );
        }
        if (createEmployeeDto.contractPeriodStartDate) {
          contractPeriodStartDate = validateDateTime(
            createEmployeeDto.contractPeriodStartDate
          );
        }
        dob = validateDateTime(createEmployeeDto.dob);
      } else {
        dob = createEmployeeDto.dob ?? null;
        postProbationDate = createEmployeeDto.postProbationDate ?? null;
        contractPeriodEndDate = createEmployeeDto.contractPeriodEndDate ?? null;
        contractPeriodStartDate =
          createEmployeeDto.contractPeriodStartDate ?? null;
        startDate = createEmployeeDto.startDate ?? null;
      }

      const accountPrefix = await this.grpcService.getGlobalConfigurationByName(
        {
          name: this.ACCOUNT_PREFIX_NAME
        }
      );

      let existingEmployee: Employee;

      if (createEmployeeDto.id) {
        existingEmployee = await this.employeeRepo.findOne({
          where: { id: createEmployeeDto.id }
        });
      }

      let updateEmployee: Employee;
      if (createEmployeeDto?.id) {
        updateEmployee = await this.employeeRepo.findOne({
          where: { id: createEmployeeDto.id }
        });
      }

      const employee = queryRunner.manager.create(Employee, {
        ...updateEmployee,
        id: createEmployeeDto?.id ? createEmployeeDto.id : null,
        userId: existingEmployee ? existingEmployee.userId : null,
        accountNo: !createEmployeeDto?.id
          ? accountPrefix.value + createEmployeeDto.accountNo
          : createEmployeeDto.accountNo,
        fingerPrintId: createEmployeeDto.fingerPrintId,
        employmentStatus: createEmployeeDto.employmentStatus,
        firstNameEn: createEmployeeDto.firstNameEn,
        lastNameEn: createEmployeeDto.lastNameEn,
        firstNameKh: createEmployeeDto.firstNameKh,
        lastNameKh: createEmployeeDto.lastNameKh,
        displayFullNameKh:
          createEmployeeDto.lastNameKh + ' ' + createEmployeeDto.firstNameKh,
        displayFullNameEn:
          createEmployeeDto.lastNameEn + ' ' + createEmployeeDto.firstNameEn,
        gender: { id: createEmployeeDto.genderId },
        startDate: startDate,
        postProbationDate: createEmployeeDto.postProbationDate
          ? postProbationDate
          : null,
        resignDate: resignDate,
        contractType: createEmployeeDto.contractType,
        contractPeriodEndDate: createEmployeeDto.contractPeriodEndDate
          ? contractPeriodEndDate
          : null,
        contractPeriodStartDate: createEmployeeDto.contractPeriodStartDate
          ? contractPeriodStartDate
          : null,
        employmentType: createEmployeeDto.employmentType,
        workingShiftId: { id: createEmployeeDto.workingShiftId },
        dob: dob,
        age: createEmployeeDto.age ? createEmployeeDto.age : null,
        placeOfBirthId: { id: createEmployeeDto.placeOfBirthId },
        nationality: { id: createEmployeeDto.nationality },
        email: createEmployeeDto.email,
        maritalStatus: createEmployeeDto.maritalStatusId
          ? { id: createEmployeeDto.maritalStatusId }
          : null,
        spouseId: createEmployeeDto.spouseId
          ? { id: createEmployeeDto.spouseId }
          : null,
        spouseOccupation: createEmployeeDto.spouseOccupation,
        numberOfChildren: createEmployeeDto.numberOfChildren,
        addressHomeNumber: createEmployeeDto.addressHomeNumber,
        addressStreetNumber: createEmployeeDto.addressStreetNumber,
        addressVillageId: createEmployeeDto.addressVillageId
          ? { id: createEmployeeDto.addressVillageId }
          : null,
        addressCommuneId: createEmployeeDto.addressCommuneId
          ? { id: createEmployeeDto.addressCommuneId }
          : null,
        addressDistrictId: createEmployeeDto.addressDistrictId
          ? { id: createEmployeeDto.addressDistrictId }
          : null,
        addressProvinceId: createEmployeeDto.addressProvinceId
          ? { id: createEmployeeDto.addressProvinceId }
          : null,
        taxResponsible: createEmployeeDto.taxResponsible,
        status: updateEmployee
          ? updateEmployee.status
          : EmployeeStatusEnum.IN_PROBATION
      });

      const employeeData = await queryRunner.manager.save(employee);
      if (employeeData && createEmployeeDto?.documentIds?.length) {
        const documentIds = createEmployeeDto.documentIds;
        if (documentIds?.length) {
          this.utilityService.updateMediaEntityIdAndType(
            documentIds,
            employeeData.id,
            MediaEntityTypeEnum.EMPLOYEE_INFO_UPDATE,
            queryRunner
          );
        }
      }

      if (employeeData) {
        //*Insert employee contacts
        await this.insertContacts(
          createEmployeeDto.contacts,
          queryRunner,
          employeeData.id
        );
        //*Insert employee emergency contacts
        await this.insertEmergencyContacts(
          createEmployeeDto.emergencyContacts,
          queryRunner,
          employeeData.id
        );

        if (createEmployeeDto?.positions?.length) {
          //* Insert Positions
          await this.insertPositions(
            createEmployeeDto.positions,
            queryRunner,
            employeeData.id,
            true,
            true
          );
        }
        //*Insert identifiers

        await this.insertIdentifiers(
          createEmployeeDto.identifiers,
          queryRunner,
          employeeData.id,
          isImported
        );

        //*Insert payment method accounts
        await this.insertPaymentMethodAccounts(
          createEmployeeDto.paymentMethodAccounts,
          queryRunner,
          employeeData.id
        );

        //*Insert insurance cards

        await this.insertInsurances(
          createEmployeeDto.insuranceCards,
          queryRunner,
          employeeData.id
        );

        //*Insert vaccination cards

        await this.insertVaccinationCards(
          createEmployeeDto.vaccinationCards,
          queryRunner,
          employeeData.id
        );

        //*Insert employee education

        await this.insertEducations(
          createEmployeeDto.educations,
          queryRunner,
          employeeData.id,
          isImported
        );

        //*Insert languages
        let languages: number[] = [];
        if (createEmployeeDto?.languages?.length) {
          if (typeof createEmployeeDto.languages[0] === 'object') {
            createEmployeeDto.languages.forEach((item: any) => {
              languages.push(item.languageId);
            });
          } else {
            languages = createEmployeeDto.languages as any;
          }

          await this.insertLanguages(languages, queryRunner, employeeData.id);
        }

        //*Insert training
        let trainings: number[] = [];
        if (createEmployeeDto?.trainings?.length) {
          if (typeof createEmployeeDto.trainings[0] === 'object') {
            createEmployeeDto.trainings.forEach((item: any) => {
              trainings.push(item.trainingId);
            });
          } else {
            trainings = createEmployeeDto.trainings as any;
          }

          await this.insertTrainings(trainings, queryRunner, employeeData.id);
        }

        //*Insert skills
        let skills: number[] = [];
        if (createEmployeeDto?.skills?.length) {
          if (typeof createEmployeeDto.skills[0] === 'object') {
            createEmployeeDto.skills.forEach((item: any) => {
              skills.push(item.skillId);
            });
          } else {
            skills = createEmployeeDto.skills as any;
          }

          await this.insertSkills(skills, queryRunner, employeeData.id);
        }
      }

      await queryRunner.commitTransaction();
      // generate employee working schedule for current year only for employee type ROSTER
      const workingShift = await this.getEmployeeWorkingShiftById(
        employee.workingShiftId.id
      );

      if (workingShift.workshiftType.name === WorkShiftTypeEnum.ROSTER) {
        await this.employeeWorkingScheduleService.createRecord(
          [employeeData],
          JobSchedulerLogTypeEnum.MANUAL,
          workingShift
        );
      }

      // generate leave stock for new employee for current year
      if (!createEmployeeDto.id) {
        await this.leaveRequestService.createLeaveStock(employeeData, true);
      }
      await this.utilityService.deleteUserMpathUnderOutlet(employeeData.id);
      return employeeData;
    } catch (exception) {
      await queryRunner.rollbackTransaction();

      const documentIds: number[] = createEmployeeDto.documentIds;
      if (documentIds?.length && !createEmployeeDto.id) {
        this.mediaService.deleteMultipleFiles(documentIds);
      }

      handleResourceConflictException(
        exception,
        employeeConstraint,
        createEmployeeDto
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getEmployeeWorkingShiftById(id: number): Promise<WorkingShift> {
    return await this.workingShiftRepo.findOne({
      where: { id },
      relations: { workshiftType: true }
    });
  }

  async resendEmailIsAdmin(employeeId: number) {
    const isAdmin = await this.utilityService.checkIsAdmin();
    if (isAdmin) {
      const employee = await this.employeeRepo.findOne({
        where: {
          id: employeeId
        },
        relations: {
          contacts: true
        },
        select: {
          id: true,
          email: true,
          userId: true,
          contacts: {
            id: true,
            isDefault: true
          }
        }
      });
      if (!employee) {
        throw new ResourceNotFoundException(`employee not found`);
      }

      if (employee.userId) {
        throw new ResourceConflictException('user');
      }

      const employeeContact = employee.contacts.find(
        (employeeContact: EmployeeContact) => employeeContact.isDefault
      );

      const otp = await this.grpcService.generateOtp(
        employeeContact.contact,
        employee.email
      );

      await this.sendConfirmationMail(
        employee.displayFullNameEn,
        employee.email,
        otp.data.code,
        otp.data.key,
        getBackOfficeResetUrl()
      );

      return employee;
    }
  }

  async sendConfirmationMail(
    username: string,
    email: string,
    otpCode: string,
    key: string,
    link: string
  ): Promise<any> {
    if (!email) {
      throw new ResourceNotFoundException('Email is required');
    }
    return await this.mailService.sendOtp(
      `
        <p>Dear ${username},</p><br>
        <p>Here is your user account<br></p>
        Your employee account has been created; therefore, please verify your account in order to be able to login by clicking here<br>
        <div style="width: 100%; text-align: center; padding-bottom: 14px; padding-top: 30px;">
        <a href="${
          link + '?key=' + key + '&code=' + otpCode + '&email=' + email
        }"
          ><button
            style="
              background-color: #7B9D4D;
              padding: 16px 40px;
              border-radius: 6px;
              font-size: 16px;
              color: white;
              font-weight: bold;
              box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
            "
          >
            Click to verify your account
          </button></a
        >
      </div>
        <p>If you did not request this email, you can safely ignore it.</p>
        `,
      email
    );
  }

  async insertContacts(
    createEmployeeContactDto: CreateEmployeeContactDto[],
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const isDefaultContact: boolean = createEmployeeContactDto.some(
      (item: CreateEmployeeContactDto) => item.isDefault
    );
    if (!isDefaultContact) {
      throw new ResourceNotFoundException(
        'You have to add at least one default contact'
      );
    }

    const employeeContacts = await this.employeeContactRepo.find({
      where: { employee: { id: employeeId } },
      relations: { employee: true }
    });

    if (employeeContacts.length) {
      const contactIds = employeeContacts.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeContact, { id: In(contactIds) });
    }

    for (const contact of createEmployeeContactDto) {
      const data = queryRunner.manager.create(EmployeeContact, {
        contact: contact.contact,
        isDefault: contact.isDefault,
        employee: { id: employeeId }
      });
      await queryRunner.manager.save(data);
    }
  }

  async insertEmergencyContacts(
    createEmployeeEmergencyContactDto: CreateEmployeeEmergencyContactDto[],
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const employeeEmergencyContacts =
      await this.employeeEmergencyContactRepo.find({
        where: { employeeId: { id: employeeId } },
        relations: { employeeId: true }
      });
    if (employeeEmergencyContacts.length) {
      const contactIds = employeeEmergencyContacts.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeEmergencyContact, {
        id: In(contactIds)
      });
    }

    if (createEmployeeEmergencyContactDto?.length) {
      for (const emergencyContact of createEmployeeEmergencyContactDto) {
        await this.validateEmployeeService.checkCodeValue(
          emergencyContact.contactRelationshipId,
          'contact relationship',
          CodeTypesEnum.RELATIONSHIP
        );

        const employeeEmergencyContact = queryRunner.manager.create(
          EmployeeEmergencyContact,
          {
            contact: emergencyContact.contact,
            contactRelationship: { id: emergencyContact.contactRelationshipId },
            employeeId: { id: employeeId }
          }
        );
        await queryRunner.manager.save(employeeEmergencyContact);
      }
    }
  }

  async insertPositions(
    createEmployeePositionDto: CreateEmployeePositionImportDto[],
    queryRunner: QueryRunner,
    employeeId: number,
    isCheckPosition: boolean,
    checkIsDefaultPosition: boolean
  ) {
    if (isCheckPosition) {
      checkDefaultPosition(createEmployeePositionDto);
    }

    for (const position of createEmployeePositionDto) {
      const companyStructurePosition = await this.companyStructureRepo.findOne({
        where: {
          id: position.positionId
        },
        relations: {
          parentId: {
            companyStructureComponent: true
          },
          companyStructureComponent: true,
          positionLevelId: true
        }
      });

      if (!companyStructurePosition) {
        throw new ResourceNotFoundException(
          this.COMPANY_STRUCTURE_POSITION,
          position.positionId
        );
      }
      if (
        companyStructurePosition.companyStructureComponent.type !==
        CompanyStructureTypeEnum.POSITION
      ) {
        throw new ResourceNotFoundException(
          `Resource of ${position.positionId} is not type of position`
        );
      }

      const mpathStructure = [];

      const structureIds: number[] = await this.findNestedStructure(
        companyStructurePosition.parentId.id,
        mpathStructure
      );

      const tempMpath = structureIds.join('.');

      const mpath =
        tempMpath.substring(0, tempMpath.length - 1) +
        '.L' +
        companyStructurePosition.positionLevelId.levelNumber;
      const structure = mpath.split('.');
      const createEmployeeContactDto: CreateEmployeePositionDto = {
        positionId: position.positionId,
        isDefaultPosition: position.isDefaultPosition,
        teamId: companyStructurePosition.parentId.id,
        departmentId: Number(structure[3]),
        outletId: Number(structure[2]),
        locationId: Number(structure[1])
      };

      await this.employeePositionService.create(
        employeeId,
        createEmployeeContactDto,
        checkIsDefaultPosition,
        queryRunner
      );
    }
  }

  findNestedStructure = async (parentId: number, mpathStructure: number[]) => {
    const companyStructure: CompanyStructure =
      await this.companyStructureRepo.findOne({
        where: { id: parentId },
        relations: {
          companyStructureComponent: true,
          parentId: true
        },
        select: {
          id: true,
          companyStructureComponent: { id: true, type: true },
          parentId: { id: true }
        }
      });

    if (!companyStructure) {
      throw new ResourceNotFoundException('company structure', parentId);
    }
    mpathStructure.unshift(parentId);

    if (
      companyStructure.companyStructureComponent.type !==
      CompanyStructureTypeEnum.COMPANY
    ) {
      await this.findNestedStructure(
        companyStructure.parentId.id,
        mpathStructure
      );
    }
    return mpathStructure;
  };

  async insertPaymentMethodAccounts(
    createEmployeePaymentMethodAccountDto: CreateEmployeePaymentMethodAccountDto[],
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const defaultAccount = createEmployeePaymentMethodAccountDto.find(
      (data) => data.isDefaultAccount
    );
    if (!defaultAccount) {
      throw new ResourceNotFoundException('default account is required');
    }

    const employeePaymentMethods =
      await this.employeePaymentMethodAccountRepo.find({
        where: { employee: { id: employeeId } },
        relations: { employee: true }
      });

    if (employeePaymentMethods.length) {
      const accountIds = employeePaymentMethods.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeePaymentMethodAccount, {
        id: In(accountIds)
      });
    }

    if (createEmployeePaymentMethodAccountDto?.length) {
      for (const paymentMethodAccount of createEmployeePaymentMethodAccountDto) {
        await this.validateEmployeeService.checkPaymentMethod(
          paymentMethodAccount.paymentMethodId
        );

        const paymentMethodAccountData = queryRunner.manager.create(
          EmployeePaymentMethodAccount,
          {
            paymentMethod: { id: paymentMethodAccount.paymentMethodId },
            accountNumber: paymentMethodAccount.accountNumber,
            isDefaultAccount: paymentMethodAccount.isDefaultAccount,
            employee: { id: employeeId }
          }
        );
        await queryRunner.manager.save(paymentMethodAccountData);
      }
    }
  }

  async insertInsurances(
    createEmployeeInsuranceDto: CreateEmployeeInsuranceDto[],
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const employeeInsurances = await this.employeeInsuranceRepo.find({
      where: { employeeId: { id: employeeId } },
      relations: { employeeId: true }
    });

    if (employeeInsurances.length) {
      const insuranceIds = employeeInsurances.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeInsurance, {
        id: In(insuranceIds)
      });
    }

    if (createEmployeeInsuranceDto?.length) {
      for (const insurance of createEmployeeInsuranceDto) {
        await this.validateEmployeeService.checkInsurance(
          insurance.insuranceId
        );
        const insuranceCard = queryRunner.manager.create(EmployeeInsurance, {
          insuranceId: { id: insurance.insuranceId },
          cardNumber: insurance.cardNumber,
          employeeId: { id: employeeId }
        });
        await queryRunner.manager.save(insuranceCard);
      }
    }
  }

  async insertIdentifiers(
    createEmployeeIdentifierDto: CreateEmployeeIdentifierDto[],
    queryRunner: QueryRunner,
    employeeId: number,
    isImported: boolean
  ) {
    const employeeIdentifiers = await this.employeeIdentifierRepo.find({
      where: { employeeId: { id: employeeId } },
      relations: { employeeId: true }
    });

    if (employeeIdentifiers.length) {
      const identifierIds = employeeIdentifiers.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeIdentifier, {
        id: In(identifierIds)
      });
    }

    if (createEmployeeIdentifierDto?.length) {
      for (const identifier of createEmployeeIdentifierDto) {
        if (identifier?.expireDate && !isImported) {
          validateDateTime(identifier.expireDate);
        }
        await this.validateEmployeeService.checkCodeValue(
          identifier.documentTypeId,
          'employee document type',
          CodeTypesEnum.DOCUMENT_TYPE
        );
        const employeeIdentifier = queryRunner.manager.create(
          EmployeeIdentifier,
          {
            description: identifier.description,
            employeeId: { id: employeeId },
            documentTypeId: { id: identifier.documentTypeId },
            documentIdentifier: identifier.documentIdentifier,
            expireDate: identifier?.expireDate
          }
        );
        await queryRunner.manager.save(employeeIdentifier);
      }
    }
  }

  async insertVaccinationCards(
    createEmployeeVaccinationDto: CreateEmployeeVaccinationDto[],
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const employeeVaccinations = await this.employeeVaccinationRepo.find({
      where: { employeeId: { id: employeeId } },
      relations: { employeeId: true }
    });

    if (employeeVaccinations.length) {
      const vaccinationIds = employeeVaccinations.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeVaccination, {
        id: In(vaccinationIds)
      });
    }
    if (createEmployeeVaccinationDto?.length) {
      for (const vaccination of createEmployeeVaccinationDto) {
        await this.validateEmployeeService.checkVaccination(
          vaccination.vaccinationId
        );
        const vaccinationCard = queryRunner.manager.create(
          EmployeeVaccination,
          {
            vaccinationId: { id: vaccination.vaccinationId },
            cardNumber: vaccination.cardNumber,
            employeeId: { id: employeeId }
          }
        );
        await queryRunner.manager.save(vaccinationCard);
      }
    }
  }

  async insertEducations(
    createEmployeeEducationDto: CreateEmployeeEducationDto[],
    queryRunner: QueryRunner,
    employeeId: number,
    isImported: boolean
  ) {
    const employeeEducations = await this.employeeEducationRepo.find({
      where: { employeeId: { id: employeeId } },
      relations: { employeeId: true }
    });

    if (employeeEducations.length) {
      const educationIds = employeeEducations.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeEducation, {
        id: In(educationIds)
      });
    }

    if (createEmployeeEducationDto?.length) {
      for (const education of createEmployeeEducationDto) {
        if (education?.startDate && !isImported) {
          validateDateTime(education.startDate);
        }

        if (education?.endDate && !isImported) {
          validateDateTime(education.startDate);
        }

        await this.validateEmployeeService.checkCodeValue(
          education.educationTypeId,
          'education type',
          CodeTypesEnum.EDUCATION_TYPE
        );
        const employeeEducation = queryRunner.manager.create(
          EmployeeEducation,
          {
            educationTypeId: { id: education.educationTypeId },
            instituteName: education.instituteName,
            major: education.major,
            startDate: education?.startDate,
            endDate: education?.endDate,
            employeeId: { id: employeeId }
          }
        );
        await queryRunner.manager.save(employeeEducation);
      }
    }
  }

  async insertLanguages(
    createEmployeeLanguageDto: number[],
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const employeeLanguages = await this.employeeLanguageRepo.find({
      where: { employeeId: { id: employeeId } },
      relations: { employeeId: true }
    });

    if (employeeLanguages.length) {
      const languageIds = employeeLanguages.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeLanguage, {
        id: In(languageIds)
      });
    }

    if (createEmployeeLanguageDto?.length) {
      for (const languageId of createEmployeeLanguageDto) {
        await this.validateEmployeeService.checkCodeValue(
          languageId,
          'language',
          CodeTypesEnum.LANGUAGE
        );
        const employeeLanguage = queryRunner.manager.create(EmployeeLanguage, {
          languageId: { id: languageId },
          employeeId: { id: employeeId }
        });
        await queryRunner.manager.save(employeeLanguage);
      }
    }
  }

  async insertTrainings(
    createEmployeeTrainingDto: number[],
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const employeeTrainings = await this.employeeTrainingRepo.find({
      where: { employeeId: { id: employeeId } },
      relations: { employeeId: true }
    });

    if (employeeTrainings.length) {
      const trainingIds = employeeTrainings.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeTraining, {
        id: In(trainingIds)
      });
    }

    if (createEmployeeTrainingDto?.length) {
      for (const trainingId of createEmployeeTrainingDto) {
        await this.validateEmployeeService.checkCodeValue(
          trainingId,
          'training',
          CodeTypesEnum.TRAINING
        );
        const employeeTraining = queryRunner.manager.create(EmployeeTraining, {
          trainingId: { id: trainingId },
          employeeId: { id: employeeId }
        });
        await queryRunner.manager.save(employeeTraining);
      }
    }
  }

  async insertSkills(
    createEmployeeSkillDto: number[],
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const employeeSkills = await this.employeeSkillRepo.find({
      where: { employeeId: { id: employeeId } },
      relations: { employeeId: true }
    });

    if (employeeSkills.length) {
      const skillIds = employeeSkills.map((item: any) => item.id);
      await queryRunner.manager.delete(EmployeeSkill, {
        id: In(skillIds)
      });
    }

    if (createEmployeeSkillDto?.length) {
      for (const skillId of createEmployeeSkillDto) {
        await this.validateEmployeeService.checkCodeValue(
          skillId,
          'skill',
          CodeTypesEnum.SKILL
        );
        const employeeSkill = queryRunner.manager.create(EmployeeSkill, {
          skillId: { id: skillId },
          employeeId: { id: employeeId }
        });
        await queryRunner.manager.save(employeeSkill);
      }
    }
  }

  async findOne(id: number) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id,
        positions: {
          isMoved: false
        }
      },
      relations: {
        gender: true,
        maritalStatus: true,
        nationality: true,
        workingShiftId: true,
        spouseId: true,
        addressCommuneId: true,
        addressDistrictId: true,
        addressVillageId: true,
        addressProvinceId: true,
        placeOfBirthId: true,
        contacts: true,
        emergencyContacts: { contactRelationship: true },
        paymentMethodAccounts: { paymentMethod: true },
        positions: {
          employee: true,
          companyStructureCompany: { companyStructureComponent: true },
          companyStructureLocation: { companyStructureComponent: true },
          companyStructureOutlet: { companyStructureComponent: true },
          companyStructureDepartment: { companyStructureComponent: true },
          companyStructureTeam: { companyStructureComponent: true },
          companyStructurePosition: {
            companyStructureComponent: true,
            positionLevelId: true
          }
        },
        identifiers: { documentTypeId: true },
        insuranceCards: { insuranceId: true },
        vaccinationCards: { vaccinationId: true },
        educations: { educationTypeId: true },
        languages: { languageId: true },
        skills: { skillId: true },
        trainings: { trainingId: true }
      },
      select: {
        positions: {
          id: true,
          mpath: true,
          isDefaultPosition: true,
          companyStructureCompany: {
            id: true,
            companyStructureComponent: { id: true, name: true, type: true }
          },
          companyStructureLocation: {
            id: true,
            companyStructureComponent: { id: true, name: true, type: true }
          },
          companyStructureOutlet: {
            id: true,
            companyStructureComponent: { id: true, name: true, type: true }
          },
          companyStructureDepartment: {
            id: true,
            companyStructureComponent: { id: true, name: true, type: true }
          },
          companyStructureTeam: {
            id: true,
            companyStructureComponent: { id: true, name: true, type: true }
          },
          companyStructurePosition: {
            id: true,
            companyStructureComponent: { id: true, name: true, type: true },
            positionLevelId: {
              id: true,
              levelNumber: true,
              levelTitle: true
            }
          }
        },
        workingShiftId: { id: true, name: true, scanType: true },
        nationality: { id: true, value: true },
        placeOfBirthId: { id: true, nameEn: true },
        spouseId: { id: true, value: true },
        addressVillageId: { id: true, nameEn: true },
        addressCommuneId: { id: true, nameEn: true },
        addressDistrictId: { id: true, nameEn: true },
        addressProvinceId: { id: true, nameEn: true },
        skills: { id: true, skillId: { id: true, value: true } },
        trainings: {
          id: true,
          trainingId: { id: true, value: true }
        },
        languages: {
          id: true,
          languageId: { id: true, value: true }
        }
      }
    });
    if (!employee) {
      throw new ResourceNotFoundException(this.EMPLOYEE, id);
    }
    return employee;
  }

  async findAll(pagination: EmployeeMasterInformationPagination) {
    if (pagination.newEmployeeInMonth) {
      checkIsValidYearFormat(
        pagination.newEmployeeInMonth,
        DEFAULT_DATE_FORMAT
      );
    }

    let statusCondition = In([
      EmployeeStatusEnum.ACTIVE,
      EmployeeStatusEnum.IN_PROBATION
    ]) as string | FindOperator<string>;

    if (pagination.status) {
      statusCondition = pagination.status;
    }

    const positionCondition = {
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
        id: pagination.positionId,
        positionLevelId: {
          levelNumber: pagination.levelNumberId
        }
      },
      isMoved: false,
      isDefaultPosition: true
    };

    let createdAtCondition: FindOperator<string> | undefined;
    if (pagination.createdFromDate && pagination.createdToDate) {
      createdAtCondition = Raw(
        (createdAt) =>
          `(TO_CHAR(${createdAt}, '${DEFAULT_DATE_FORMAT}') BETWEEN '${pagination.createdFromDate}' AND '${pagination.createdToDate}')`
      );
    }

    const createdByCondition =
      await this.utilityService.handleSearchByEmployeeCreatedBy(
        pagination.createdByUserId,
        pagination.createdByEmployeeId
      );

    const employeeIds: number[] =
      await this.utilityService.getCurrentUserMpath(null);
    const getMonth: string = dayJs(pagination.newEmployeeInMonth).format(
      DEFAULT_MONTH_FORMAT
    );
    const getYear: string = dayJs(pagination.newEmployeeInMonth).format(
      DEFAULT_YEAR_FORMAT
    );

    const employeeConditon = {
      createdAt: createdAtCondition,
      createdBy: createdByCondition,
      status: statusCondition,
      id: In(employeeIds),
      positions: positionCondition,
      gender: {
        id: pagination.genderId
      },
      startDate: pagination.newEmployeeInMonth
        ? Raw(
            (startDate) => `(EXTRACT(YEAR FROM ${startDate}) = ${getYear} 
      AND EXTRACT(MONTH FROM ${startDate}) = ${getMonth})`
          )
        : null,
      contacts: { contact: pagination.contactNumber },
      employmentType: pagination.employmentType,
      workingShiftId: {
        id: pagination.workshiftId,
        workshiftType: {
          id: pagination.workshiftTypeId,
          name: pagination.workShiftType
        }
      }
    };
    const data = await this.employeeRepo.findAllWithPagination(
      pagination,
      employeeSearchableColumns,
      {
        where: [
          {
            ...employeeConditon,
            displayFullNameEn:
              pagination.displayName && ILike(`%${pagination.displayName}%`)
          },
          {
            ...employeeConditon,
            displayFullNameKh:
              pagination.displayName && ILike(`%${pagination.displayName}%`)
          }
        ] as FindOptionsWhere<Employee>,
        relation: EMPLOYEE_RELATIONSHIP,
        select: EMPLOYEE_SELECTED_FIELDS,
        mapFunction: (employee: Employee) => {
          return {
            ...employee,
            gender: employee.gender.value,
            isDefaultPosition: employee?.positions?.at(0)?.isDefaultPosition
          };
        }
      }
    );

    // mapping employee's user before response.
    data.data = await this.mappingEmployeeUser(data.data);

    return data;
  }

  async findWorkingTypeWithNotFound(
    workShiftType: WorkShiftTypeEnum
  ): Promise<WorkshiftType> {
    const result = await this.workshiftTypeRepository.findOne({
      where: {
        name: workShiftType
      }
    });
    if (!result) {
      throw new ResourceNotFoundException('workshiftType', workShiftType);
    }
    return result;
  }

  async findAllWithTemplate(pagination: EmployeeMasterInformationPagination) {
    const workingShiftType: WorkshiftType =
      pagination?.workShiftType &&
      (await this.findWorkingTypeWithNotFound(pagination.workShiftType));

    const employeeIds = await this.utilityService.getCurrentUserMpath(null);

    const data = await this.employeeRepo.findAllWithPagination(
      pagination,
      ['accountNo', 'displayFullNameEn', 'displayFullNameKh'],
      {
        select: {
          id: true,
          firstNameEn: true,
          lastNameEn: true,
          firstNameKh: true,
          lastNameKh: true,
          accountNo: true,
          displayFullNameEn: true,
          displayFullNameKh: true,
          email: true
        },
        where: {
          id: In(employeeIds),
          status:
            pagination.status ??
            In([EmployeeStatusEnum.ACTIVE, EmployeeStatusEnum.IN_PROBATION]),
          employmentType: pagination.employmentType
            ? pagination.employmentType
            : null,
          workingShiftId: workingShiftType
            ? {
                workshiftType: {
                  id: workingShiftType.id
                }
              }
            : null
        },
        relation: {
          workingShiftId: !!workingShiftType
        },
        mapFunction: (employee: Employee) => {
          removeUnnecessaryProps(employee);
          return employee;
        }
      }
    );

    return data;
  }

  async delete(id: number): Promise<void> {
    const employee = await this.employeeRepo.findOne({
      where: {
        id,
        positions: {
          isMoved: false
        }
      },
      relations: {
        contacts: true,
        emergencyContacts: true,
        paymentMethodAccounts: true,
        vaccinationCards: true,
        positions: true,
        educations: true,
        identifiers: true,
        insuranceCards: true,
        languages: true,
        skills: true,
        trainings: true
      }
    });
    if (!employee) {
      throw new ResourceNotFoundException(this.EMPLOYEE, id);
    }
    if (employee.contacts.length > 0) {
      const contactIds = [];
      employee.contacts.forEach((contact) => {
        contactIds.push(contact.id);
      });
      await this.employeeContactRepo.delete(contactIds);
    }

    if (employee.emergencyContacts.length > 0) {
      const emergencyContactIds = [];
      employee.emergencyContacts.forEach((emergencyContact) => {
        emergencyContactIds.push(emergencyContact.id);
      });
      await this.employeeEmergencyContactRepo.delete(emergencyContactIds);
    }

    if (employee.paymentMethodAccounts.length > 0) {
      const paymentMethodAccountIds = [];
      employee.paymentMethodAccounts.forEach((paymentMethodAccount) => {
        paymentMethodAccountIds.push(paymentMethodAccount.id);
      });
      await this.employeePaymentMethodAccountRepo.delete(
        paymentMethodAccountIds
      );
    }

    if (employee.insuranceCards.length > 0) {
      const insuranceCardIds = [];
      employee.paymentMethodAccounts.forEach((insuranceCard) => {
        insuranceCardIds.push(insuranceCard.id);
      });
      await this.employeeInsuranceRepo.delete(insuranceCardIds);
    }

    if (employee.positions.length > 0) {
      const positionIds = [];
      employee.positions.forEach((position) => {
        positionIds.push(position.id);
      });
      await this.employeePositionRepo.delete(positionIds);
    }

    if (employee.vaccinationCards.length > 0) {
      const vaccinationIds = [];
      employee.vaccinationCards.forEach((vaccinationCard) => {
        vaccinationIds.push(vaccinationCard.id);
      });
      await this.employeeVaccinationRepo.delete(vaccinationIds);
    }

    if (employee.educations.length > 0) {
      const educationIds = [];
      employee.educations.forEach((education) => {
        educationIds.push(education.id);
      });
      await this.employeeEducationRepo.delete(educationIds);
    }

    if (employee.languages.length > 0) {
      const languagesIds = [];
      employee.languages.forEach((language) => {
        languagesIds.push(language.id);
      });
      await this.employeeLanguageRepo.delete(languagesIds);
    }

    if (employee.identifiers.length > 0) {
      const identifierIds = [];
      employee.identifiers.forEach((identifier) => {
        identifierIds.push(identifier.id);
      });
      await this.employeeIdentifierRepo.delete(identifierIds);
    }

    if (employee.skills.length > 0) {
      const skillIds = [];
      employee.skills.forEach((skill) => {
        skillIds.push(skill.id);
      });
      await this.employeeSkillRepo.delete(skillIds);
    }

    if (employee.trainings.length > 0) {
      const trainingIds = [];
      employee.trainings.forEach((training) => {
        trainingIds.push(training.id);
      });
      await this.employeeTrainingRepo.delete(trainingIds);
    }
    await this.employeeRepo.delete(id);
  }

  async findOneByEmailGrpc(request: EmployeeProto.EmployeeEmail) {
    const employee = await this.employeeRepo.findOne({
      where: {
        email: request.email,
        positions: {
          isMoved: false
        }
      }
    });

    if (!employee) {
      throw new RpcException({
        message: `employee of email ${request.email} not found`,
        code: 5
      });
    }

    const employeeContact = await this.employeeContactRepo.findOneBy({
      employee: { id: employee.id },
      isDefault: true
    });

    return {
      id: employee.id,
      accountNo: employee.accountNo,
      firstNameEn: employee.firstNameEn,
      lastNameEn: employee.lastNameEn,
      email: employee.email,
      phone: employeeContact.contact
    };
  }

  async grpcGetEmployeeByUserId(request: EmployeeProto.User) {
    const employee = await this.employeeRepo.findOne({
      where: {
        userId: request.userId,
        contacts: { isDefault: true },
        positions: { isDefaultPosition: true, isMoved: false }
      },
      relations: EMPLOYEE_RELATIONSHIP,
      select: EMPLOYEE_SELECTED_FIELDS
    });

    if (!employee) {
      throw new RpcException({
        message: `employee of user ${request.userId} not found`,
        code: 5
      });
    }

    if (employee.positions.length === 0) {
      throw new RpcException({
        message: `employee of use ${request.userId} does not have position`,
        code: 5
      });
    }

    if (employee.positions[0]) {
      const data = employee.positions[0];
      let message: string;
      let status = false;
      if (!data.companyStructureLocation) {
        message = 'location';
        status = true;
      } else if (!data.companyStructureOutlet) {
        message = 'outlet';
        status = true;
      } else if (!data.companyStructureDepartment) {
        message = 'department';
        status = true;
      } else if (!data.companyStructurePosition) {
        message = 'position';
        status = true;
      }
      if (status) {
        throw new RpcException({
          message: `employee of use ${request.userId} does not have ${message}`,
          code: 5
        });
      }
    }
    return {
      id: employee.id,
      accountNo: employee.accountNo,
      firstNameEn: employee.firstNameEn,
      lastNameEn: employee.lastNameEn,
      email: employee.email,
      phone: employee.contacts[0].contact,
      location:
        employee.positions.length > 0
          ? employee.positions[0].companyStructureLocation
              .companyStructureComponent.name
          : '',
      outlet:
        employee.positions.length > 0
          ? employee.positions[0].companyStructureOutlet
              .companyStructureComponent.name
          : '',
      department:
        employee.positions.length > 0
          ? employee.positions[0].companyStructureDepartment
              .companyStructureComponent.name
          : '',
      team:
        employee.positions.length > 0
          ? employee.positions[0].companyStructureTeam.companyStructureComponent
              .name
          : '',
      position:
        employee.positions.length > 0
          ? employee.positions[0].companyStructurePosition
              .companyStructureComponent.name
          : ''
    };
  }

  async findOneByPhoneGrpc(request: EmployeeProto.Phone) {
    const employeeContact = await this.employeeContactRepo.findOne({
      where: { contact: request.phone },
      relations: { employee: true }
    });

    if (!employeeContact) {
      throw new RpcException({
        message: `${request.phone} is invalid for user.`,
        code: 5
      });
    }

    return {
      id: employeeContact.employee.id,
      accountNo: employeeContact.employee.accountNo,
      firstNameEn: employeeContact.employee.firstNameEn,
      lastNameEn: employeeContact.employee.lastNameEn,
      email: employeeContact.employee.email,
      phone: employeeContact.contact
    };
  }

  async grpcUpdateEmployee(updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.employeeRepo.findOne({
      where: { id: updateEmployeeDto.id },
      relations: EMPLOYEE_RELATIONSHIP_FOR_CREATE_AND_UPDATE,
      select: EMPLOYEE_SELECTED_FIELDS_FOR_UPDATE_AND_CREATE
    });
    if (!employee) {
      throw new ResourceNotFoundException(this.EMPLOYEE, updateEmployeeDto.id);
    }

    return await this.createEmployee(updateEmployeeDto);
  }

  async updateEmployeeGrpc(request: EmployeeProto.EmployeeUpdate) {
    try {
      if (!request.phone && !request.email) {
        throw new RpcException({
          message: `employee of phone or email not found`,
          code: 5
        });
      }
      const employeeContact = await this.employeeContactRepo.findOne({
        where: { contact: request.phone },
        relations: {
          employee: true
        }
      });

      if (!employeeContact) {
        throw new RpcException({
          message: `Resource of employee with ${request.phone} not found`,
          code: 5
        });
      }

      const employee = await this.employeeRepo.findOne({
        where: {
          id: employeeContact.employee.id,
          positions: {
            isMoved: false
          }
        }
      });

      if (!employee) {
        throw new RpcException({
          message: `Resource of employee ${employeeContact.employee.id} not found`,
          code: 5
        });
      }

      await this.employeeRepo.save(
        Object.assign(employee, { userId: request.userId })
      );

      return {
        id: employee.id,
        firstNameEn: employee.firstNameEn,
        lastNameEn: employee.lastNameEn,
        email: employee.email,
        phone: employeeContact.contact
      };
    } catch (error) {
      return error;
    }
  }

  checkDisplayFullName(
    updateEmployeeDto: UpdateEmployeeDto,
    employee: Employee,
    suffix: string
  ) {
    if (
      updateEmployeeDto['firstName' + suffix] &&
      updateEmployeeDto['lastName' + suffix]
    ) {
      return (
        updateEmployeeDto['firstName' + suffix] +
        ' ' +
        updateEmployeeDto['lastName' + suffix]
      );
    } else if (
      updateEmployeeDto['firstName' + suffix] ||
      updateEmployeeDto['lastName' + suffix]
    ) {
      if (updateEmployeeDto['firstName' + suffix]) {
        return (
          updateEmployeeDto['firstName' + suffix] +
          ' ' +
          employee['lastName' + suffix]
        );
      } else {
        return (
          employee['firstName' + suffix] +
          ' ' +
          updateEmployeeDto['lastName' + suffix]
        );
      }
    } else {
      return employee.displayFullNameEn;
    }
  }

  async checkEmployeeAlreadyRequestToUpdate(id: number) {
    const approvalStatus = await this.dataSource
      .getRepository(ApprovalStatus)
      .findOne({
        where: {
          employee: { id },
          requestWorkflowType: {
            requestType: WorkflowTypeEnum.EMPLOYEE_INFO_UPDATE
          },
          status: ApprovalStatusEnum.PENDING
        },
        relations: { employee: true, requestWorkflowType: true }
      });

    if (approvalStatus) {
      throw new ResourceBadRequestException(
        'id',
        `Employee has already requested to update the information. Please cancel the pending record to re-update again.`
      );
    }
  }

  async getCurrentEmployee(userId: number): Promise<Employee> {
    return await this.employeeRepo.findOneBy({ userId: userId });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    await this.validateEmployeeService.checkValidationWithDifferentTables(
      updateEmployeeDto
    );

    const userId = getCurrentUserFromContext();
    const isAdmin = await this.utilityService.checkIsAdmin();
    const employee = await this.findOne(id);

    let approvalWorkflow: any;
    if (!isAdmin) {
      const currentEmployee = await this.getCurrentEmployee(userId);

      if (currentEmployee.id !== employee.id) {
        throw new ResourceBadRequestException(
          'Update employee information',
          'You can only update your own information.'
        );
      }

      await this.checkEmployeeAlreadyRequestToUpdate(id);
      approvalWorkflow = await this.utilityService.validateWithWorkflow(
        employee,
        RequestWorkFlowTypeEnum.EMPLOYEE_INFO_UPDATE
      );
    }

    updateEmployeeDto.startDate &&
      validateDateTime(updateEmployeeDto.startDate);

    updateEmployeeDto.postProbationDate &&
      validateDateTime(updateEmployeeDto.postProbationDate);

    updateEmployeeDto.resignDate &&
      validateDateTime(updateEmployeeDto.resignDate);

    updateEmployeeDto.contractPeriodEndDate &&
      validateDateTime(updateEmployeeDto.contractPeriodEndDate);

    updateEmployeeDto.contractPeriodStartDate &&
      validateDateTime(updateEmployeeDto.contractPeriodStartDate);

    this.checkDisplayFullName(updateEmployeeDto, employee, 'En');

    this.checkDisplayFullName(updateEmployeeDto, employee, 'Kh');

    updateEmployeeDto.dob && validateDateTime(updateEmployeeDto.dob);
    let result: Employee;
    if (!isAdmin) {
      result = employee;
      delete updateEmployeeDto?.positions;
      const originalDto = JSON.parse(JSON.stringify(updateEmployeeDto));
      let updateChangesJson: any = await this.mappingChangeData(
        employee,
        updateEmployeeDto
      );

      if (!Object.keys(updateChangesJson).length) {
        throw new ResourceBadRequestException(
          `Update Employee`,
          `You can't request to update employee information because of no value changed.`
        );
      }
      updateChangesJson = await this.mappingJson(updateChangesJson);

      const fakeJson: any = {
        userId: null,
        accountNo: '',
        fingerPrintId: '',
        employmentStatus: '',
        firstNameEn: '',
        lastNameEn: '',
        firstNameKh: '',
        lastNameKh: '',
        displayFullNameEn: '',
        gender: { id: 0 },
        startDate: null,
        postProbationDate: null,
        resignDate: null,
        contractType: '',
        contractPeriodEndDate: null,
        contractPeriodStartDate: null,
        employmentType: '',
        workingShiftId: { id: 0 },
        dob: '',
        age: null,
        placeOfBirthId: { id: 0 },
        nationality: { id: 0 },
        email: '',
        maritalStatus: { id: 0 },
        spouseId: { id: 0 },
        spouseOccupation: 0,
        numberOfChildren: 0,
        addressHomeNumber: 0,
        addressStreetNumber: 0,
        addressVillageId: { id: 0 },
        addressCommuneId: { id: 0 },
        addressDistrictId: { id: 0 },
        addressProvinceId: { id: 0 },
        taxResponsible: '',
        contacts: [],
        emergencyContacts: [],
        identifiers: [],
        educations: [],
        paymentMethodAccounts: [],
        insuranceCards: [],
        languages: [],
        skills: [],
        trainings: [],
        vaccinationCards: []
      };
      let updateEmployeeDtoChange: any = await this.mappingChangeData(
        fakeJson,
        updateEmployeeDto
      );
      updateEmployeeDtoChange = await this.mappingJson(updateEmployeeDtoChange);

      originalDto['id'] = id;

      const approvalStatusDto: CreateApprovalStatusTrackingDto = {
        employeeInfo: JSON.stringify(employee),
        approvalWorkflowId: approvalWorkflow.requestApprovalWorkflowId,
        requestWorkflowTypeId: approvalWorkflow.workflowTypeId,
        requestChangeOriginalJson: JSON.stringify(originalDto),
        entityId: employee.id,
        requestToUpdateBy: userId,
        requestToUpdateChange: JSON.stringify(updateChangesJson),
        requestToUpdateJson: JSON.stringify(updateEmployeeDtoChange),
        firstApprovalUserId: null,
        secondApprovalUserId: null,
        status: ApprovalStatusEnum.PENDING
      };

      const approvalStatus = await this.utilityService.createApprovalStatus(
        approvalStatusDto,
        approvalWorkflow.requesterPosition,
        employee.id
      );

      // attach document to media when update employee by ess user.
      if (approvalStatus && updateEmployeeDto?.documentIds?.length) {
        this.attachMediaWithQueryRunner(
          updateEmployeeDto.documentIds,
          approvalStatus.id,
          MediaEntityTypeEnum.UPDATE_EMPLOYEE_ATTACHMENT
        );
      }
    } else {
      updateEmployeeDto.id = id;
      delete updateEmployeeDto?.positions;
      result = await this.createEmployee(updateEmployeeDto);
    }

    return result;
  }

  async mappingJson(updateChangesJson: any) {
    if (updateChangesJson?.emergencyContacts?.length) {
      for (const element of updateChangesJson.emergencyContacts) {
        if (!element['isDeleted'] && element['contactRelationshipId']) {
          element['contactRelationship'] = await this.getResponseFromTables(
            'relationshipId',
            element['contactRelationshipId']
          );
          delete element['contactRelationshipId'];
        }
      }
    }

    if (updateChangesJson?.identifiers?.length) {
      for (const element of updateChangesJson.identifiers) {
        if (!element['isDeleted']) {
          element['documentType'] = await this.getResponseFromTables(
            'documentTypeId',
            element['documentTypeId']
          );
          delete element['documentTypeId'];
        }
      }
    }

    if (updateChangesJson?.paymentMethodAccounts?.length) {
      for (const element of updateChangesJson.paymentMethodAccounts) {
        if (!element['isDeleted']) {
          element['paymentMethod'] = await this.getResponseFromTables(
            'paymentMethodId',
            element['paymentMethodId']
          );
          delete element['paymentMethodId'];
        }
      }
    }

    if (updateChangesJson?.insuranceCards?.length) {
      for (const element of updateChangesJson.insuranceCards) {
        if (!element['isDeleted']) {
          element['insurance'] = await this.getResponseFromTables(
            'insuranceId',
            element['insuranceId']
          );

          delete element['insuranceId'];
        }
      }
    }
    if (updateChangesJson?.vaccinationCards?.length) {
      for (const element of updateChangesJson.vaccinationCards) {
        if (!element['isDeleted']) {
          element['vaccination'] = await this.getResponseFromTables(
            'vaccinationId',
            element['vaccinationId']
          );
          delete element['vaccinationId'];
        }
      }
    }

    if (updateChangesJson?.educations?.length) {
      for (const element of updateChangesJson.educations) {
        if (!element['isDeleted']) {
          element['educationType'] = await this.getCodeValueById(
            element['educationTypeId'],
            CodeTypesEnum.EDUCATION_TYPE
          );
          delete element['educationTypeId'];
        }
      }
    }

    if (updateChangesJson?.languages?.length) {
      for (const element of updateChangesJson.languages) {
        if (!element['isDeleted']) {
          element['languageId'] = await this.getCodeValueById(
            element['languageId'],
            CodeTypesEnum.LANGUAGE
          );
        }
      }
    }
    if (updateChangesJson?.skills?.length) {
      for (const element of updateChangesJson.skills) {
        if (!element['isDeleted']) {
          element['skillId'] = await this.getCodeValueById(
            element['skillId'],
            CodeTypesEnum.SKILL
          );
        }
      }
    }

    if (updateChangesJson?.trainings?.length) {
      for (const element of updateChangesJson.trainings) {
        if (!element['isDeleted']) {
          element['trainingId'] = await this.getCodeValueById(
            element['trainingId'],
            CodeTypesEnum.TRAINING
          );
        }
      }
    }

    return updateChangesJson;
  }

  async findOneByEntityId(request: EntityParam) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: request.id,
        displayFullNameEn: request.employeeName
          ? ILike(`%${request.employeeName}%`)
          : null,
        positions: {
          isMoved: false,
          isDefaultPosition: true,
          companyStructurePosition: {
            id: request.positionLevelId ? request.positionLevelId : null
          },
          companyStructureOutlet: {
            id: request.outletId ? request.outletId : null
          },
          companyStructureDepartment: {
            id: request.departmentId ? request.departmentId : null
          },
          companyStructureLocation: {
            id: request.locationId ? request.locationId : null
          },
          companyStructureTeam: {
            id: request.teamId ? request.teamId : null
          }
        }
      },
      relations: {
        positions: {
          companyStructureCompany: { companyStructureComponent: true },
          companyStructureLocation: { companyStructureComponent: true },
          companyStructureOutlet: { companyStructureComponent: true },
          companyStructureDepartment: { companyStructureComponent: true },
          companyStructureTeam: { companyStructureComponent: true },
          companyStructurePosition: { companyStructureComponent: true }
        },
        contacts: true
      },
      select: {
        id: true,
        displayFullNameEn: true,
        startDate: true,
        email: true,
        accountNo: true,
        positions: {
          id: true,
          isDefaultPosition: true,
          companyStructureCompany: {
            id: true,
            companyStructureComponent: { id: true, name: true }
          },
          companyStructureLocation: {
            id: true,
            companyStructureComponent: { id: true, name: true }
          },
          companyStructureOutlet: {
            id: true,
            companyStructureComponent: { id: true, name: true }
          },
          companyStructureDepartment: {
            id: true,
            companyStructureComponent: { id: true, name: true }
          },
          companyStructureTeam: {
            id: true,
            companyStructureComponent: { id: true, name: true }
          },
          companyStructurePosition: {
            id: true,
            companyStructureComponent: { id: true, name: true }
          }
        },
        contacts: { id: true, contact: true }
      }
    });
    if (!employee) {
      return null;
    }

    return {
      id: employee.id,
      firstNameEn: employee.firstNameEn,
      lastNameEn: employee.lastNameEn,
      phone: employee.contacts[0].contact,
      email: employee.email,
      accountNo: employee.accountNo,
      location:
        employee.positions[0]?.companyStructureLocation
          ?.companyStructureComponent.name ?? null,
      outlet:
        employee.positions[0]?.companyStructureOutlet?.companyStructureComponent
          .name ?? null,
      department:
        employee.positions[0]?.companyStructureDepartment
          ?.companyStructureComponent.name ?? null,
      team:
        employee.positions[0]?.companyStructureTeam?.companyStructureComponent
          .name ?? null,
      position:
        employee.positions[0]?.companyStructurePosition
          ?.companyStructureComponent.name ?? null,
      displayFullNameEn: employee.displayFullNameEn,
      employeeId: employee.id
    };
  }

  async grpcGetEmployeeById(employeeId: EmployeeProto.EmployeeId) {
    const whereCondition = {
      id: employeeId.employeeId,
      contacts: { isDefault: true },
      positions: { isDefaultPosition: true, isMoved: false }
    } as FindOptionsWhere<Employee>;

    const employee =
      await this.employeeRepo.getOneEmployeeByProvidedCondition(whereCondition);

    if (!employee) {
      throw new RpcException({
        message: `employee of ${employeeId.employeeId} not found`,
        code: 5
      });
    }

    if (!employee.positions.length) {
      throw new RpcException({
        message: `employee of ${employeeId.employeeId} does not have position`,
        code: 5
      });
    }

    if (employee.positions[0]) {
      const data = employee.positions[0];
      let message: string;
      let status = false;
      if (!data.companyStructureLocation) {
        message = 'location';
        status = true;
      } else if (!data.companyStructureOutlet) {
        message = 'outlet';
        status = true;
      } else if (!data.companyStructureDepartment) {
        message = 'department';
        status = true;
      } else if (!data.companyStructurePosition) {
        message = 'position';
        status = true;
      }
      if (status) {
        throw new RpcException({
          message: `employee of use ${employeeId.employeeId} does not have ${message}`,
          code: 5
        });
      }
    }

    return {
      data: {
        id: employee.id,
        email: employee.email,
        firstNameEn: employee.firstNameEn,
        lastNameEn: employee.lastNameEn,
        dob: employee.dob,
        gender: employee.gender.value,
        startDate: employee.startDate,
        maritalStatus: employee.maritalStatus.value,
        workingShiftId: employee.workingShiftId,
        positionLevelId:
          employee.positions[0]?.companyStructurePosition?.positionLevelId.id ??
          null,
        createdBy: employee.createdBy,
        userId: employee.userId,
        location:
          employee?.positions[0]?.companyStructureLocation
            ?.companyStructureComponent?.name ?? null,
        outlet:
          employee?.positions[0]?.companyStructureOutlet
            ?.companyStructureComponent?.name ?? null,
        department:
          employee?.positions[0]?.companyStructureDepartment
            ?.companyStructureComponent?.name ?? null,
        team:
          employee?.positions[0]?.companyStructureTeam
            ?.companyStructureComponent?.name ?? null,
        position:
          employee?.positions[0]?.companyStructurePosition
            ?.companyStructureComponent?.name ?? null,
        displayFullNameEn: employee.displayFullNameEn
      }
    };
  }

  async grpcGetEmployeeForCurrentUser(userId: number): Promise<any> {
    const user = await this.grpcService.getUserById(userId);
    if (user.isSelfService) {
      const employee = await this.employeeRepo.getEmployeeByUserId(
        user.id,
        false
      );
      if (!employee) {
        return {};
      }
      if (employee) {
        const profile = await this.utilityService.getMedia(
          employee.id,
          MediaEntityTypeEnum.EMPLOYEE_PROFILE
        );

        const currentEmployeeWithProfileDto = { ...employee, profile };
        return plainToInstance(
          CurrentEmployeeDto,
          currentEmployeeWithProfileDto
        );
      }
    } else {
      return {
        id: null
      };
    }
  }

  handelPaginationOrderBy(pagination: any) {
    switch (pagination.orderBy) {
      case 'workShiftTypeId': {
        pagination.orderBy = 'workingShiftId.workshiftType.id';
        break;
      }
      case 'levelNumber': {
        pagination.orderBy =
          'positions.companyStructurePosition.positionLevelId.levelNumber';
        break;
      }

      case 'genderId': {
        pagination.orderBy = 'gender.value';
        break;
      }
      case 'location': {
        pagination.orderBy =
          'positions.companyStructureLocation.companyStructureComponent.name';
        break;
      }
      case 'outlet': {
        pagination.orderBy =
          'positions.companyStructureOutlet.companyStructureComponent.name';
        break;
      }
      case 'department': {
        pagination.orderBy =
          'positions.companyStructureDepartment.companyStructureComponent.name';
        break;
      }
      case 'team': {
        pagination.orderBy =
          'positions.companyStructureTeam.companyStructureComponent.name';
        break;
      }
      case 'position': {
        pagination.orderBy =
          'positions.companyStructurePosition.companyStructureComponent.name';
        break;
      }
      case 'displayFullNameEn': {
        pagination.orderBy = 'displayFullNameEn';
        break;
      }
      case 'displayFullNameKh': {
        pagination.orderBy = 'displayFullNameKh';
        break;
      }
      case 'firstNameEn': {
        pagination.orderBy = 'firstNameEn';
        break;
      }
      case 'firstNameKh': {
        pagination.orderBy = 'firstNameKh';
        break;
      }
      case 'accountNo': {
        pagination.orderBy = 'accountNo';
        break;
      }
      case 'status': {
        pagination.orderBy = 'status';
        break;
      }
      default:
        throw new ResourceBadRequestException(`Invalid column`);
    }
    return pagination.orderBy;
  }

  async updatePostProbation(
    updatePostProbationDto?: UpdatePostProbation,
    id?: number
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      let employees: Employee | Employee[];
      let updatedEmployee: Employee;

      if (id) {
        // find employee one
        employees = await queryRunner.manager.findOne(Employee, {
          where: {
            id,
            status: EmployeeStatusEnum.IN_PROBATION
          }
        });
        if (!employees) {
          throw new ResourceNotFoundException('employee', id);
        }
        this.validateExtendAndPassProbation(updatePostProbationDto);

        if (updatePostProbationDto.extendToDate) {
          const extendToDate = validateDateTime(
            updatePostProbationDto.extendToDate
          );
          this.validateExtendDateWithCurrentDate(extendToDate);
          employees.postProbationDate = extendToDate;
          updatedEmployee = await this.employeeRepo.save(employees);
        } else if (
          updatePostProbationDto.passProbationStatus ===
          UpdateProbationEmployeeStatusEnum.FAILED_PROBATION
        ) {
          updatedEmployee = await this.updateStatusWhenUpdatePostProbation(
            queryRunner,
            employees,
            EmployeeStatusEnum.RESIGNED
          );
        } else {
          updatedEmployee = await this.updateStatusWhenUpdatePostProbation(
            queryRunner,
            employees,
            EmployeeStatusEnum.ACTIVE
          );

          await this.updatePostProbationSalaryToPayrollBenefit(
            updatedEmployee.id,
            queryRunner
          );
        }
      } else {
        // handle for scheduler update employee probation
        const currentDate = getCurrentDate().format(`${DEFAULT_DATE_FORMAT}`);
        const whereProbationDate = new Date(currentDate);
        Logger.log(`currentDate ${currentDate}`);
        Logger.log(`whereProbationDate ${whereProbationDate}`);
        employees = await queryRunner.manager.find(Employee, {
          where: {
            status: EmployeeStatusEnum.IN_PROBATION,
            postProbationDate: LessThanOrEqual(whereProbationDate)
          }
        });

        for (const employee of employees) {
          updatedEmployee = await this.updateStatusWhenUpdatePostProbation(
            queryRunner,
            employee,
            EmployeeStatusEnum.ACTIVE
          );
          await this.updatePostProbationSalaryToPayrollBenefit(
            employee.id,
            queryRunner
          );
        }
      }
      await queryRunner.commitTransaction();
      return updatedEmployee;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  validateExtendDateWithCurrentDate(requestExtendDate: Date): void {
    const currentDate: string = getCurrentDateWithFormat();
    const extendDate: string = convertDateTimeToGivenFormat(
      requestExtendDate,
      DEFAULT_DATE_FORMAT
    );

    const isLessThanOrEqualCurrentDate = extendDate <= currentDate;

    if (isLessThanOrEqualCurrentDate) {
      throw new ResourceBadRequestException(
        'extendToDate',
        'The extend date should not be less than the current date'
      );
    }
  }

  async updateStatusWhenUpdatePostProbation(
    queryRunner: QueryRunner,
    employee: Employee,
    status: EmployeeStatusEnum
  ) {
    const employeeUpdate = await queryRunner.manager.findOne(Employee, {
      where: {
        id: employee.id,
        status: EmployeeStatusEnum.IN_PROBATION
      }
    });

    employeeUpdate.status = status;

    return await queryRunner.manager.save(employeeUpdate);
  }

  validateExtendAndPassProbation(updatePostProbationDto: UpdatePostProbation) {
    if (
      updatePostProbationDto.passProbationStatus &&
      updatePostProbationDto.extendToDate
    ) {
      throw new ResourceForbiddenException(
        `You can't update probation while extend it`
      );
    }
  }

  async updatePostProbationSalaryToPayrollBenefit(
    employeeId: number,
    queryRunner: QueryRunner
  ): Promise<void> {
    const employee: Employee =
      await this.getEmployeeWithIncrementPolicy(employeeId);

    //check employee's default position
    const employeeType: string = employee.workingShiftId.workshiftType.name;

    const benefitIncrementPolicyDetails: BenefitIncreasementPolicyDetail[] =
      employee.positions[0].companyStructurePosition
        ?.postProbationBenefitIncrementPolicy?.benefitIncreasementPolicyDetail;

    const hasIncreasementPolicy = benefitIncrementPolicyDetails?.length || [];

    //check increment policy of employee
    if (employeeType === 'ROSTER' && hasIncreasementPolicy) {
      await this.createPayrollBenefitAdjustmentAndDetails(
        benefitIncrementPolicyDetails,
        employeeId,
        queryRunner
      );
    }
  }

  async createPayrollBenefitAdjustmentAndDetails(
    benefitIncrementPolicyDetails: BenefitIncreasementPolicyDetail[],
    employeeId: number,
    queryRunner: QueryRunner
  ) {
    const currentDate: any = getCurrentDate();
    const payrollBenefitAdjustment: PayrollBenefitAdjustment =
      await this.createPayrollBenefitAdjustment(queryRunner, employeeId);

    if (benefitIncrementPolicyDetails?.length) {
      const hasAttendanceAllowance = this.findAttendanceAllowance(
        benefitIncrementPolicyDetails
      );

      //create payroll benefit adjustment when not found benefit increment policy of allowance
      if (!hasAttendanceAllowance) {
        await this.createPayrollBenefitAdjustmentWhenNoAllowance(
          queryRunner,
          payrollBenefitAdjustment,
          currentDate
        );
      }

      //create payroll benefit adjustment details
      await this.createPayrollBenefitAdjustmentDetail(
        payrollBenefitAdjustment,
        benefitIncrementPolicyDetails,
        currentDate,
        queryRunner
      );
    } else {
      //create payroll benefit adjustment when no benefit increment policy of allowance
      await this.createPayrollBenefitAdjustmentWhenNoAllowance(
        queryRunner,
        payrollBenefitAdjustment,
        currentDate
      );
    }
  }

  findAttendanceAllowance(
    benefitIncrementPolicyDetails: BenefitIncreasementPolicyDetail[]
  ): boolean {
    return benefitIncrementPolicyDetails.some(
      (benefitIncrementPolicyDetail: BenefitIncreasementPolicyDetail) => {
        if (
          benefitIncrementPolicyDetail.benefitComponent.benefitComponentType
            .name === 'ALLOWANCE'
        ) {
          return benefitIncrementPolicyDetail;
        }
      }
    );
  }

  async createPayrollBenefitAdjustmentDetail(
    payrollBenefitAdjustment: PayrollBenefitAdjustment,
    benefitIncrementPolicyDetails: BenefitIncreasementPolicyDetail[],
    currentDate: Date | string,
    queryRunner: QueryRunner
  ) {
    for (const benefitIncreasement of benefitIncrementPolicyDetails) {
      const payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail =
        queryRunner.manager.create(PayrollBenefitAdjustmentDetail, {
          payrollBenefitAdjustment: { id: payrollBenefitAdjustment.id },
          adjustAmount: benefitIncreasement.increasementAmount,
          effectiveDateFrom: currentDate,
          benefitComponent: { id: benefitIncreasement.benefitComponent.id }
        });

      await queryRunner.manager.save(payrollBenefitAdjustmentDetail);
    }
  }

  async createPayrollBenefitAdjustment(
    queryRunner: QueryRunner,
    employeeId: number
  ) {
    const adjustmentType: BenefitAdjustmentType =
      await this.adjustmentTypeRepo.findOneBy({
        name: this.ADJUSTMENT_TYPE
      });

    if (!adjustmentType) {
      throw new ResourceNotFoundException(
        `The system cannot find the ${this.ADJUSTMENT_TYPE.toLowerCase()} type name`
      );
    }

    const payrollBenefitAdjustment: PayrollBenefitAdjustment =
      queryRunner.manager.create(PayrollBenefitAdjustment, {
        employee: { id: employeeId },
        status: StatusEnum.ACTIVE,
        adjustmentType: { id: adjustmentType.id }
      });
    return await queryRunner.manager.save(payrollBenefitAdjustment);
  }

  async createPayrollBenefitAdjustmentWhenNoAllowance(
    queryRunner: QueryRunner,
    payrollBenefitAdjustment: PayrollBenefitAdjustment,
    currentDate: Date | string
  ) {
    const globalConfiguration =
      await this.grpcService.getGlobalConfigurationByName({
        name: 'attendance-allowance'
      });

    const benefitComponent: BenefitComponent =
      await this.getBenefitComponentTypeAllowance();
    const payrollBenefitAdjustmentDetail: PayrollBenefitAdjustmentDetail =
      queryRunner.manager.create(PayrollBenefitAdjustmentDetail, {
        payrollBenefitAdjustment: { id: payrollBenefitAdjustment.id },
        adjustAmount: Number(globalConfiguration.value),
        effectiveDateFrom: currentDate,
        benefitComponent: { id: benefitComponent.id }
      });

    await queryRunner.manager.save(payrollBenefitAdjustmentDetail);
  }

  async getBenefitComponentTypeAllowance() {
    return await this.benefitComponentRepo.findOne({
      where: { benefitComponentType: { name: 'ALLOWANCE' } },
      relations: { benefitComponentType: true }
    });
  }

  async getEmployeeWithIncrementPolicy(employeeId: number): Promise<Employee> {
    return await this.employeeRepo.findOne({
      where: { id: employeeId, positions: { isDefaultPosition: true } },
      relations: {
        workingShiftId: { workshiftType: true },
        positions: {
          companyStructurePosition: {
            companyStructureComponent: {
              postProbationBenefitIncreasementPolicy: {
                benefitIncreasementPolicyDetail: {
                  benefitComponent: { benefitComponentType: true }
                }
              }
            },
            postProbationBenefitIncrementPolicy: {
              benefitIncreasementPolicyDetail: {
                benefitComponent: { benefitComponentType: true }
              }
            }
          }
        }
      },
      select: {
        id: true,
        workingShiftId: { id: true, workshiftType: { id: true, name: true } }
      }
    });
  }

  async checkUniqueContactAndEmail(pagination: EmployeeUniquePagination) {
    if (pagination.type === UNIQUE_COLUMN.EMPLOYEE_CONTACT) {
      const employeeContact = await this.employeeContactRepo.findOne({
        where: {
          contact: pagination.contact ?? null,
          employee: {
            id: pagination?.employeeId && Not(pagination.employeeId)
          }
        },
        relations: { employee: true }
      });
      if (employeeContact) {
        throw new ResourceConflictException('contact');
      }
      return employeeContact;
    } else if (pagination.type === UNIQUE_COLUMN.EMPLOYEE_EMAIL) {
      const employee = await this.employeeRepo.findOne({
        where: {
          email: pagination.email ?? null,
          id: pagination?.employeeId && Not(pagination.employeeId)
        }
      });
      if (employee) {
        throw new ResourceConflictException('email');
      }
      return employee;
    } else if (pagination.type === UNIQUE_COLUMN.EMPLOYEE_ACCOUNT_NO) {
      const employee = await this.employeeRepo.findOne({
        where: {
          id: pagination?.employeeId && Not(pagination.employeeId),
          accountNo: pagination.accountNo ?? ''
        }
      });
      if (employee) {
        throw new ResourceConflictException('accountNo');
      }
      return employee;
    }
  }

  async GrpcGetAllEmployeeMpath() {
    const employees = await this.employeeRepo.find({
      where: {
        positions: {
          isMoved: false
        }
      },
      relations: { positions: true },
      select: {
        id: true,
        status: true,
        positions: {
          id: true,
          mpath: true
        }
      }
    });

    if (employees.length > 0) {
      const data = employees.map((employee: Employee) => {
        return {
          id: employee.id,
          mpath: employee?.positions.map(
            (position: EmployeePosition) => position.mpath
          )
        };
      });
      return {
        data: data
      };
    }
    return { data: [] as any };
  }

  async mappingChangeData(
    employee: Employee,
    updateEmployeeDto: UpdateEmployeeDto
  ) {
    const updateChangesJson = {};
    let count = 0;
    for (const [originalKey, value] of Object.entries(updateEmployeeDto)) {
      let key = originalKey;
      /**For normal value of employee information*/
      if (!Array.isArray(value)) {
        const temp = this.checkCodeValueData(key);
        if (temp) {
          key = temp[key];
          if (!employee[key] || employee[key]?.id !== value) {
            count++;
            updateChangesJson[key] = await this.getResponseFromTables(
              originalKey,
              value
            );
          }
        } else if (employee[key] !== value) {
          count++;
          updateChangesJson[originalKey] = value;
        }
        /**Related data of employee*/
      } else {
        const arrayObject = [];
        const itemIds = this.getIdsFromValue(value);

        //add deleted objects to updateToChangesJson and remove from employee
        employee[key]?.forEach((element: any) => {
          if (!itemIds.includes(element.id)) {
            count++;
            element['isDeleted'] = true;
            arrayObject.push(element);
            employee[key] = employee[key].filter(
              (item: any) => item.id !== element.id
            );
          }
        });

        // check whether update or create
        value.forEach((item: any) => {
          const obj = {};

          if (item?.id) {
            const updatedElement = employee[key].find(
              (element: any) => element.id === item.id
            );

            if (updatedElement) {
              for (const [objKey, objValue] of Object.entries(item)) {
                const newKey = this.checkArrayObjectKey(objKey);
                if (
                  objKey
                    .substring(objKey.length - 2, objKey.length)
                    .includes('Id')
                ) {
                  if (updatedElement[newKey]?.id !== objValue) {
                    count++;
                    obj['id'] = updatedElement.id;
                    obj['isUpdated'] = true;
                    obj[objKey] = objValue;
                  } else {
                    obj[objKey] = objValue;
                  }
                } else if (updatedElement[objKey] !== objValue) {
                  count++;
                  obj['id'] = updatedElement.id;
                  obj['isUpdated'] = true;
                  obj[objKey] = objValue;
                } else {
                  obj[objKey] = objValue;
                }
              }
            }
          } else {
            //create if no id given
            obj['isCreated'] = true;
            count++;
            for (const [objKey, objValue] of Object.entries(item)) {
              obj[objKey] = objValue;
            }
          }

          if (Object.keys(obj).length) {
            arrayObject.push(obj);
          }
        });

        if (arrayObject?.length) {
          updateChangesJson[key] = arrayObject;
        }
      }
    }

    if (count === 0) {
      throw new ResourceBadRequestException(
        `Update Employee`,
        `You can't request to update employee information because of no value changed.`
      );
    }

    return updateChangesJson;
  }

  getIdsFromValue(value: any) {
    const itemIds = [];
    value.forEach((item: any) => {
      if (item?.id) {
        itemIds.push(item?.id);
      }
    });
    return itemIds;
  }

  getIdsOfEmployeeDataByKey(key: string, employee: Employee): number[] {
    return employee[key].map((element: any) => element.id);
  }

  getIdKey(target: object) {
    for (const key in target) {
      if (key.includes('Id')) {
        return {
          [key?.substring(key.length - 2, key.length)?.toLocaleLowerCase()]:
            target[key] ?? target
        };
      }
    }
  }

  checkArrayObjectKey(key: string) {
    const arrayKeys = ['contactRelationshipId', 'paymentMethodId'];
    if (arrayKeys.includes(key)) {
      return key.substring(0, key.length - 2);
    }

    return key;
  }

  checkCodeValueData(key: string) {
    const items = [
      { genderId: 'gender' },
      { workingShiftId: 'workingShiftId' },
      { spouseId: 'spouseId' },
      { maritalStatusId: 'maritalStatus' },
      { nationality: 'nationality' },
      { addressVillageId: 'addressVillageId' },
      { addressProvinceId: 'addressProvinceId' },
      { addressDistrictId: 'addressDistrictId' },
      { addressCommuneId: 'addressCommuneId' },
      { placeOfBirthId: 'placeOfBirthId' }
    ];
    return items.find((element: any) => element[key]);
  }

  async getCodeValueById(id: number, type: CodeTypesEnum) {
    const codeValue: CodeValue = await this.codeValueRepository.findOne({
      where: { id, codeId: { code: type } },
      relations: { code: true }
    });

    if (!codeValue) {
      throw new ResourceNotFoundException(
        `Resource ${type} of ${id} not found.`
      );
    }

    return {
      id: codeValue.id,
      value: codeValue.value
    };
  }

  async getGeographicById(id: number, type: GeographicTypeEnum) {
    const geographic = await this.geographicRepo.findOne({
      where: { id, geographicType: type }
    });

    return {
      id: geographic.id,
      nameEn: geographic.nameEn,
      type: geographic.geographicType
    };
  }

  async getWorkingShiftById(id: number) {
    return await this.workingShiftRepo.findOne({
      where: { id },
      relations: { workshiftType: true }
    });
  }

  async getVaccination(id: number) {
    return await this.dataSource
      .getRepository(Vaccination)
      .findOne({ where: { id }, select: { id: true, name: true } });
  }

  async getPaymentMethodById(id: number) {
    return await this.dataSource
      .getRepository(PaymentMethod)
      .findOne({ where: { id }, select: { id: true, name: true } });
  }

  async getInsuranceById(id: number) {
    return await this.dataSource
      .getRepository(Insurance)
      .findOne({ where: { id }, select: { id: true, name: true } });
  }

  async getResponseFromTables(key: string, id: number) {
    switch (key) {
      case 'genderId': {
        return await this.getCodeValueById(id, CodeTypesEnum.GENDER);
      }
      case 'relationshipId': {
        return await this.getCodeValueById(id, CodeTypesEnum.RELATIONSHIP);
      }
      case 'spouseId': {
        return await this.getCodeValueById(id, CodeTypesEnum.RELATIONSHIP);
      }
      case 'nationality': {
        return await this.getCodeValueById(id, CodeTypesEnum.NATIONALITY);
      }
      case 'maritalStatusId': {
        return await this.getCodeValueById(id, CodeTypesEnum.MARITAL_STATUS);
      }
      case 'placeOfBirthId': {
        return await this.getGeographicById(id, GeographicTypeEnum.PROVINCE);
      }
      case 'addressCommuneId': {
        return await this.getGeographicById(id, GeographicTypeEnum.COMMUNE);
      }
      case 'addressVillageId': {
        return await this.getGeographicById(id, GeographicTypeEnum.VILLAGE);
      }
      case 'addressDistrictId': {
        return await this.getGeographicById(id, GeographicTypeEnum.DISTRICT);
      }
      case 'addressProvinceId': {
        return await this.getGeographicById(id, GeographicTypeEnum.PROVINCE);
      }
      case 'documentTypeId': {
        return await this.getCodeValueById(id, CodeTypesEnum.DOCUMENT_TYPE);
      }
      case 'educationTypeId': {
        return await this.getCodeValueById(id, CodeTypesEnum.EDUCATION_TYPE);
      }
      case 'vaccinationId': {
        return await this.getVaccination(id);
      }
      case 'insuranceId': {
        return await this.getInsuranceById(id);
      }
      case 'paymentMethodId': {
        return await this.getPaymentMethodById(id);
      }
      case 'workingShiftId': {
        return await this.getWorkingShiftById(id);
      }
      default:
        break;
    }
  }

  async cancelEmployeeUpdateInformation(employeeId: number) {
    const employee: Employee =
      await this.employeeRepo.getEmployeeById(employeeId);

    const workflowType: RequestWorkFlowType =
      await this.requestWorkflowTypeValidationService.findRequestWorkflowTypeByType(
        WorkflowTypeEnum.EMPLOYEE_INFO_UPDATE
      );

    const approvalStatus: ApprovalStatus =
      await this.approvalStatusValidationValidationService.getApprovalStatusByWorkflowTypeAndEmployeeId(
        workflowType,
        employee.id
      );

    return await this.dataSource
      .getRepository(ApprovalStatus)
      .save(
        Object.assign(approvalStatus, { status: ApprovalStatusEnum.CANCEL })
      );
  }

  private async mappingEmployeeUser(
    employees: Employee[]
  ): Promise<Employee[]> {
    for (const employee of employees) {
      employee.createdBy =
        (await this.employeeRepo.getEmployeeWithUserTemplateByUserId(
          employee?.createdBy
        )) as any;

      if (employee.userId) {
        employee['user'] = await this.grpcService.getUserById(employee.userId);
        delete employee.userId;
      }
    }

    return employees;
  }

  private async attachMediaWithQueryRunner(
    documentIds: number[],
    approvalStatusId: number,
    entityType: MediaEntityTypeEnum
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.utilityService.updateMediaEntityIdAndType(
        documentIds,
        approvalStatusId,
        entityType,
        queryRunner
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
