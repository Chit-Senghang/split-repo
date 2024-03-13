import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Between, DataSource, FindOperator, ILike, In, Raw } from 'typeorm';
import { ResourceBadRequestException } from '../../shared-resources/exception/badRequest.exception';
import { GlobalConfigurationNameEnum } from '../../shared-resources/common/enum/global-configuration-name.enum';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../../shared-resources/export-file/common/enum/data-table-name.enum';
import { validateByStatusActive } from '../../shared-resources/utils/validate-by-status.utils';
import { EmployeeProto } from '../../shared-resources/proto';
import { dayJs } from '../../shared-resources/common/utils/date-utils';
import { StatusEnum } from '../../shared-resources/common/enums/status.enum';
import { ResourceNotFoundException } from '../../shared-resources/exception/resource-not-found.exception';
import { GrpcService } from '../../grpc/grpc.service';
import { Employee } from '../../employee/entity/employee.entity';
import { RequestWorkFlowTypeEnum } from '../../request-workflow-type/common/ts/enum/request-workflow-type.enum';
import { UtilityService } from '../../utility/utility.service';
import { MediaService } from '../../media/media.service';
import { CreateApprovalStatusTrackingDto } from '../../approval-status-tracking/dto/create-approval-status-tracking.dto';
import {
  checkIsValidYearFormat,
  validateDateTime
} from '../../shared-resources/utils/validate-date-format';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATE_TIME_FORMAT
} from '../../shared-resources/common/dto/default-date-format';
import { ApprovalStatusTrackingValidationService } from '../../approval-status-tracking/approval-status-tracking-validation.service';
import { ApprovalStatusEnum } from '../../approval-status-tracking/common/ts/enum/approval-status.enum';
import { MediaEntityTypeEnum } from '../../media/common/ts/enums/entity-type.enum';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { AttendanceReportService } from '../attendance-report/attendance-report.service';
import { AttendanceRecordRepository } from '../attendance-record/repository/attendance-record.repository';
import { EmployeePosition } from '../../employee-position/entities/employee-position.entity';
import { IAttendanceRecordRepository } from '../attendance-record/repository/interface/attendance-record.interface';
import { EmployeeActiveStatusEnum } from '../../employee/enum/employee-status.enum';
import { UpdateMissedScanRequestDto } from './dto/update-missed-scan-request.dto';
import { PaginationQueryMissedScanRequestDto } from './dto/pagination-query-missed-scan-request.dto';
import {
  MissedScanRequest,
  missedScanRequestSearchableColumns
} from './entities/missed-scan-request.entity';
import { CreateMissedScanRequestDto } from './dto/create-missed-scan-request.dto';
import { MissedScanRequestRepository } from './repository/missed-scan-request.repository';
import { IMissedScanRequestRepository } from './repository/interface/missed-scan-request.repository.interface';

interface MissedScanParams {
  id?: number;
  employeeId?: number;
}

@Injectable()
export class MissedScanRequestService {
  private readonly MISSED_SCAN_REQUEST = 'missed scan request';

  constructor(
    @Inject(MissedScanRequestRepository)
    private readonly missedScanRequestRepo: IMissedScanRequestRepository,
    private readonly grpcService: GrpcService,
    private readonly dataSource: DataSource,
    private readonly utilityService: UtilityService,
    private readonly mediaService: MediaService,
    private readonly approvalStatusValidationService: ApprovalStatusTrackingValidationService,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository,
    private readonly attendanceReportService: AttendanceReportService,
    @Inject(AttendanceRecordRepository)
    private readonly attendanceRecordRepo: IAttendanceRecordRepository
  ) {}

  validateAllActions = async (params: MissedScanParams) => {
    let employee: Employee;
    let missedScan: MissedScanRequest;

    if (params.employeeId) {
      employee = await this.employeeRepo.getEmployeeById(params.employeeId);
    }

    if (params.id) {
      missedScan = await this.missedScanRequestRepo.findOne({
        where: {
          id: params.id
        },
        relations: {
          employee: { workingShiftId: true },
          reasonTemplate: true
        },
        select: {
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        }
      });
      if (!missedScan) {
        throw new ResourceNotFoundException('missed scan request', params.id);
      }
    }

    return params.id ? missedScan : employee;
  };

  async create(createMissedScanRequestDto: CreateMissedScanRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    let response: MissedScanRequest;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const { requestDate, reason, scanTime } = createMissedScanRequestDto;

      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        createMissedScanRequestDto.reasonTemplateId,
        createMissedScanRequestDto.reason
      );

      if (dayJs(requestDate).isAfter(dayJs().toDate())) {
        throw new ResourceBadRequestException(
          'request date',
          'Request date must be before or same as current date.'
        );
      }

      const employee = await this.employeeRepo.getEmployeeById(
        createMissedScanRequestDto.employeeId
      );

      const allowMissScanTime =
        await this.grpcService.getGlobalConfigurationByName({
          name: `${GlobalConfigurationNameEnum.ALLOW_MISS_SCAN_TIME}`
        });

      const missedScan = await this.missedScanRequestRepo.find({
        where: {
          employee: { id: employee.id },
          requestDate: Between(
            dayJs(requestDate).startOf('month').toDate(),
            dayJs(requestDate).endOf('month').toDate()
          )
        }
      });

      const totalMissedWithUpcoming = missedScan.length + 1;

      if (totalMissedWithUpcoming > Number(allowMissScanTime.value)) {
        throw new ResourceBadRequestException(
          'scan time',
          `You can not request missed scan more than ${allowMissScanTime.value} per month.`
        );
      }

      const isAdmin = await this.utilityService.checkIsAdmin();

      const missedScanDateTime = dayJs(`${requestDate} ${scanTime}`).toDate();
      let status = StatusEnum.ACTIVE;
      let result: any;
      if (!isAdmin) {
        status = StatusEnum.PENDING;
        result = await this.utilityService.validateWithWorkflow(
          employee,
          RequestWorkFlowTypeEnum.MISSED_SCAN
        );

        const missedScanDoc = queryRunner.manager.create(MissedScanRequest, {
          reasonTemplate: { id: createMissedScanRequestDto.reasonTemplateId },
          requestDate: dayJs(requestDate).utc(true).toDate(),
          employee: employee,
          scanTime: missedScanDateTime,
          reason,
          status
        });
        response = await queryRunner.manager.save(missedScanDoc);

        const approvalStatusDto: CreateApprovalStatusTrackingDto = {
          approvalWorkflowId: result.requestApprovalWorkflowId,
          requestWorkflowTypeId: result.workflowTypeId,
          entityId: response.id,
          requestToUpdateBy: null,
          requestToUpdateChange: null,
          requestToUpdateJson: null,
          firstApprovalUserId: null,
          secondApprovalUserId: null,
          status: ApprovalStatusEnum.PENDING
        };

        await this.utilityService.createApprovalStatus(
          approvalStatusDto,
          result.requesterPosition,
          employee.id
        );
      } else {
        const missedScanDoc = queryRunner.manager.create(MissedScanRequest, {
          reasonTemplate: { id: createMissedScanRequestDto.reasonTemplateId },
          requestDate: dayJs(requestDate).utc(true).toDate(),
          employee: employee,
          scanTime: missedScanDateTime,
          reason,
          status
        });
        response = await queryRunner.manager.save(missedScanDoc);
      }

      if (response && createMissedScanRequestDto?.documentIds?.length) {
        const documentIds = createMissedScanRequestDto.documentIds;
        await this.utilityService.updateMediaEntityIdAndType(
          documentIds,
          response.id,
          MediaEntityTypeEnum.MISSED_SCAN,
          queryRunner
        );
      }

      await queryRunner.commitTransaction();
      if (isAdmin) {
        await this.insertFingerPrintRecord(employee, missedScanDateTime);
        await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
          employee.id,
          missedScanDateTime
        );
      }
      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const documentIds: number[] = createMissedScanRequestDto?.documentIds;
      if (documentIds?.length) {
        this.mediaService.deleteMultipleFiles(documentIds);
      }

      throw error;
    } finally {
      queryRunner.release();
    }
  }

  async exportFile(
    pagination: PaginationQueryMissedScanRequestDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.MISSED_SCAN_REQUEST,
      exportFileDto,
      data
    );
  }

  async findAll(pagination: PaginationQueryMissedScanRequestDto) {
    if (pagination.fromDate && !pagination.toDate) {
      throw new ResourceNotFoundException(
        `You need to add query fromDate and toDate format(YYYY-MM-DD)`
      );
    }

    if (pagination.toDate && !pagination.fromDate) {
      throw new ResourceNotFoundException(
        `You need to add query fromDate and toDate format(YYYY-MM-DD)`
      );
    }

    if (pagination.fromDate) {
      checkIsValidYearFormat(pagination.fromDate, DEFAULT_DATE_FORMAT);
    }

    if (pagination.toDate) {
      checkIsValidYearFormat(pagination.toDate, DEFAULT_DATE_FORMAT);
    }

    const employeeIds: number[] = await this.utilityService.getCurrentUserMpath(
      pagination.employeeId
    );

    let createdAtCondition: FindOperator<undefined | Date>;
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

    return await this.missedScanRequestRepo.findAllWithPagination(
      pagination,
      missedScanRequestSearchableColumns,
      {
        where: {
          createdAt: createdAtCondition,
          createdBy: createdByCondition,
          employee: {
            id: In(employeeIds),
            status: In(Object.values(EmployeeActiveStatusEnum)),
            displayFullNameKh: pagination.keywords
              ? ILike(`%${pagination.keywords}%`)
              : null,
            positions: {
              isMoved: false,
              isDefaultPosition: true,
              companyStructureCompany: {
                id: pagination.companyId
              },
              companyStructureLocation: {
                id: pagination.locationId
              },
              companyStructureDepartment: {
                id: pagination.departmentId
              },
              companyStructureOutlet: {
                id: pagination.outletId
              },
              companyStructureTeam: {
                id: pagination.teamId
              },
              companyStructurePosition: {
                id: pagination.positionId
              }
            },
            displayFullNameEn: pagination.displayFullNameEn
              ? ILike(`%${pagination.displayFullNameEn}%`)
              : null,
            accountNo: pagination.accountNo
              ? ILike(`%${pagination.accountNo}%`)
              : null
          },
          requestDate:
            pagination.fromDate && pagination.toDate
              ? Between(pagination.fromDate, pagination.toDate)
              : null,
          status: pagination.status ?? StatusEnum.ACTIVE,
          reason: pagination.reason ? ILike(`%${pagination.reason}%`) : null,
          reasonTemplate: { id: pagination.reasonTemplateId }
        },
        relation: {
          employee: {
            maritalStatus: true,
            gender: true,
            positions: {
              companyStructurePosition: {
                positionLevelId: true,
                companyStructureComponent: true
              },
              companyStructureOutlet: { companyStructureComponent: true },
              companyStructureDepartment: { companyStructureComponent: true },
              companyStructureTeam: { companyStructureComponent: true },
              companyStructureLocation: { companyStructureComponent: true }
            },
            workingShiftId: true
          },
          reasonTemplate: true
        },
        select: {
          employee: {
            id: true,
            email: true,
            firstNameEn: true,
            accountNo: true,
            dob: true,
            gender: { id: true, value: true },
            startDate: true,
            displayFullNameEn: true,
            maritalStatus: { id: true, value: true },
            workingShiftId: {
              id: true,
              name: true
            },
            positions: {
              id: true,
              mpath: true,
              isDefaultPosition: true,
              companyStructurePosition: {
                id: true,
                positionLevelId: {
                  id: true,
                  levelTitle: true
                }
              },
              companyStructureOutlet: {
                id: true,
                companyStructureComponent: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          },
          reasonTemplate: {
            id: true,
            type: true,
            name: true
          }
        },
        mapFunction: async (missedScanRequest: MissedScanRequest) => {
          if (missedScanRequest.employee) {
            const employee = missedScanRequest.employee;
            return {
              ...missedScanRequest,
              createdBy:
                await this.employeeRepo.getEmployeeWithUserTemplateByUserId(
                  missedScanRequest.createdBy
                ),
              employee: {
                id: employee.id,
                email: employee.email,
                accountNo: employee.accountNo,
                firstNameEn: employee.firstNameEn,
                mpath: employee.positions[0].mpath,
                dob: employee.dob,
                gender: employee.gender.value,
                startDate: employee.startDate,
                maritalStatus: employee.maritalStatus.value,
                workingShift: {
                  id: employee.workingShiftId.id,
                  name: employee.workingShiftId.name
                },
                isDefaultPosition:
                  employee?.positions?.at(0)?.isDefaultPosition,
                displayFullNameEn: employee.displayFullNameEn,
                location:
                  employee.positions[0].companyStructureLocation
                    .companyStructureComponent.name,
                outlet:
                  employee.positions[0].companyStructureOutlet
                    .companyStructureComponent.name,
                department:
                  employee.positions[0].companyStructureDepartment
                    .companyStructureComponent.name,
                team: employee.positions[0].companyStructureTeam
                  .companyStructureComponent.name,
                position:
                  employee.positions[0].companyStructurePosition
                    .companyStructureComponent.name
              }
            };
          }
        }
      }
    );
  }

  async findOne(id: number) {
    const missedScanRequest: any = await this.validateAllActions({ id });
    const employee = missedScanRequest.employee;
    delete missedScanRequest.employee;
    return {
      ...missedScanRequest,
      employee: {
        id: employee?.id,
        email: employee.email,
        firstNameEn: employee.firstNameEn,
        dob: employee.dob,
        gender: employee.gender,
        startDate: employee.startDate,
        maritalStatus: employee.maritalStatus,
        workingShift: {
          id: employee.workingShiftId?.id,
          name: employee.workingShiftId.name
        }
      }
    };
  }

  async update(
    id: number,
    updateMissedScanRequestDto: UpdateMissedScanRequestDto
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const missedScanRequest: any = await this.validateAllActions({
        id,
        employeeId: updateMissedScanRequestDto.employeeId
      });
      validateByStatusActive(missedScanRequest.status);

      // validate reason template and check type OTHER without reason throw error.
      await this.utilityService.validateTypeOtherInReasonTemplate(
        updateMissedScanRequestDto.reasonTemplateId ??
          missedScanRequest.reasonTemplate.id,
        updateMissedScanRequestDto.reason
      );
      // check if current user is creator or not.
      await this.utilityService.checkCurrentUserIsCreatorOrNot(
        missedScanRequest.createdBy
      );

      let scanTime: any;

      if (
        !updateMissedScanRequestDto.requestDate &&
        updateMissedScanRequestDto.scanTime
      ) {
        const scanDate = dayJs(missedScanRequest.scanTime)
          .utc(true)
          .format(DEFAULT_DATE_FORMAT);

        scanTime = dayJs(scanDate + updateMissedScanRequestDto.scanTime)
          .utc(true)
          .format(DEFAULT_DATE_TIME_FORMAT);
      } else if (
        updateMissedScanRequestDto.requestDate &&
        updateMissedScanRequestDto.scanTime
      ) {
        scanTime = dayJs(
          updateMissedScanRequestDto.requestDate +
            updateMissedScanRequestDto.scanTime
        )
          .utc(true)
          .format(DEFAULT_DATE_TIME_FORMAT);
      }

      const missedScanRequestUpdate = queryRunner.manager.create(
        MissedScanRequest,
        Object.assign(missedScanRequest, {
          ...updateMissedScanRequestDto,
          reasonTemplate: { id: updateMissedScanRequestDto.reasonTemplateId },
          scanTime: updateMissedScanRequestDto.scanTime && scanTime,
          requestDate: updateMissedScanRequestDto.requestDate
            ? validateDateTime(updateMissedScanRequestDto.requestDate)
            : missedScanRequest.requestDate,
          employee: { id: updateMissedScanRequestDto.employeeId },
          status: StatusEnum.PENDING
        })
      );
      const updatedMissedScanRequest = await queryRunner.manager.save(
        missedScanRequestUpdate
      );

      //Update or delete media by given documentIds
      if (updatedMissedScanRequest && updateMissedScanRequestDto?.documentIds) {
        const documentIds = updateMissedScanRequestDto.documentIds;
        await this.utilityService.updateMediaEntityIdAndType(
          documentIds,
          updatedMissedScanRequest.id,
          MediaEntityTypeEnum.MISSED_SCAN,
          queryRunner
        );
      }
      //End
      await queryRunner.commitTransaction();

      return updatedMissedScanRequest;
    } catch (exception) {
      await queryRunner.rollbackTransaction();
      throw exception;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: number) {
    await this.approvalStatusValidationService.deleteEntityById(
      id,
      MediaEntityTypeEnum.MISSED_SCAN
    );
  }

  async grpcUpdateStatus(request: EmployeeProto.EmployeeStatusParams) {
    const missedScan = await this.missedScanRequestRepo.findOne({
      where: { id: request.id },
      relations: { employee: { workingShiftId: { workshiftType: true } } }
    });

    const employee: Employee = await this.employeeRepo.getEmployeeById(
      missedScan.employee.id
    );

    if (!missedScan) {
      throw new RpcException({
        message: `Resource missed scan of ${request.id} not found`,
        code: 5
      });
    }
    const result = await this.missedScanRequestRepo.save(
      Object.assign(missedScan, { status: request.status })
    );

    if (request.status === ApprovalStatusEnum.ACTIVE) {
      await this.insertFingerPrintRecord(employee, missedScan.scanTime);
      await this.attendanceReportService.recalculateAttendanceReportForBackDateRequest(
        missedScan.employee.id,
        missedScan.requestDate
      );
    }

    return { employeeId: result.id };
  }

  private async insertFingerPrintRecord(employee: Employee, scanTime: Date) {
    //** Find outlet of default position */
    const defaultEmployeePosition = employee.positions.find(
      (position: EmployeePosition) => position.isDefaultPosition
    );

    const attendanceRecord = this.attendanceRecordRepo.create({
      isMissedScan: true,
      scanTime,
      companyStructureOutletId: {
        id: defaultEmployeePosition.companyStructureOutlet.id
      },
      fingerPrintId: employee.fingerPrintId
    });
    await this.attendanceRecordRepo.save(attendanceRecord);
  }
}
