import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { PaginationResponse } from '../../shared-resources/ts/interface/response.interface';
import { PublicHolidayRepository } from '../../attendance/public-holiday/repository/public-holiday.repository';
import { IPublicHolidayRepository } from '../../attendance/public-holiday/repository/interface/public-holiday.repository.interface';
import { ResourceBadRequestException } from '../../shared-resources/exception/badRequest.exception';
import { LeaveRequestRepository } from '../leave-request/repository/leave-request.repository';
import { ILeaveRequestRepository } from '../leave-request/repository/interface/leave-request-repository.interface';
import { EmployeeRepository } from '../../employee/repository/employee.repository';
import { IEmployeeRepository } from '../../employee/repository/interface/employee.repository.interface';
import { DataTableNameEnum } from './../../shared-resources/export-file/common/enum/data-table-name.enum';
import { leaveConstraint } from './../../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../../shared-resources/common/utils/handle-resource-conflict-exception';
import { UpdateLeaveRequestTypeDto } from './dto/update-leave-request-type.dto';
import { PaginationLeaveRequestTypeDto } from './dto/pagination-leave-request-type.dto';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveTypeDto } from './dto/create-leave-type.dto';
import { LeaveTypeVariation } from './entities/leave-type-variation.entity';
import { LeaveTypeVariationRepository } from './repository/leave-type-variation.repository';
import { ILeaveTypeVariationRepository } from './repository/interface/leave-type-variation.repository.interface';
import { LeaveTypeRepository } from './repository/leave-type.repository';
import { ILeaveTypeRepository } from './repository/interface/leave-type.repository.interface';

@Injectable()
export class LeaveRequestTypeService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(LeaveTypeVariationRepository)
    private readonly leaveTypeVariationRepo: ILeaveTypeVariationRepository,
    @Inject(LeaveTypeRepository)
    private readonly leaveTypeRepo: ILeaveTypeRepository,
    @Inject(PublicHolidayRepository)
    private readonly publicHolidayRepo: IPublicHolidayRepository,
    @Inject(LeaveRequestRepository)
    private readonly leaveRequestRepo: ILeaveRequestRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  async create(createLeaveTypeDto: LeaveTypeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const leaveTypeData = queryRunner.manager.create(LeaveType, {
        leaveTypeName: createLeaveTypeDto.leaveTypeName,
        leaveTypeNameKh: createLeaveTypeDto.leaveTypeNameKh,
        carryForwardAllowance: createLeaveTypeDto.carryForwardAllowance,
        carryForwardStatus: createLeaveTypeDto.carryForwardStatus,
        coverFrom: { id: createLeaveTypeDto.coverFrom },
        incrementRule: createLeaveTypeDto.incrementRule ?? 0,
        incrementAllowance: createLeaveTypeDto.incrementAllowance ?? 0,
        requiredDoc: createLeaveTypeDto.requiredDoc ?? 0,
        isPublicHoliday: createLeaveTypeDto.isPublicHoliday
      });

      const leaveType = await queryRunner.manager.save(leaveTypeData);

      if (leaveType) {
        //Assign priority value
        const priorityMaxValue: number = await queryRunner.manager.query(
          `SELECT Max(priority) AS value FROM leave_type`
        );
        await queryRunner.manager.query(
          `UPDATE leave_type SET priority = ${
            priorityMaxValue[0].value + 1
          } WHERE id = ${leaveType.id}`
        );

        for (const leaveTypeVariation of createLeaveTypeDto.leaves) {
          let allowancePerYear = leaveTypeVariation.allowancePerYear;
          let proratePerMonth = leaveTypeVariation.proratePerMonth;

          //case validate leave as holiday
          if (createLeaveTypeDto?.isPublicHoliday) {
            const publicHolidays =
              await this.publicHolidayRepo.getPublicHolidayInCurrentYear();
            allowancePerYear = publicHolidays.length ?? 0;
            proratePerMonth = 0;
          }

          // validate special leave
          this.validateSpecialAllowanceDay(
            leaveTypeVariation.specialLeaveAllowanceDay,
            allowancePerYear
          );

          const leaveTypeVariationEntity = queryRunner.manager.create(
            LeaveTypeVariation,
            {
              allowancePerYear,
              employmentType: leaveTypeVariation?.employmentType,
              employeeStatus: leaveTypeVariation?.employeeStatus,
              genderId: { id: leaveTypeVariation?.gender },
              leaveType: { id: leaveType.id },
              proratePerMonth,
              benefitAllowanceDay: leaveTypeVariation.benefitAllowanceDay ?? 0,
              benefitAllowancePercentage:
                leaveTypeVariation.benefitAllowancePercentage ?? 0,
              specialLeaveAllowanceDay:
                leaveTypeVariation.specialLeaveAllowanceDay ?? 0
            }
          );

          await queryRunner.manager.save(leaveTypeVariationEntity);
        }
      }
      await queryRunner.commitTransaction();

      //generate leave stock for new type for background process since it might take long time
      if (createLeaveTypeDto?.isGenerateLeaveStock) {
        this.leaveRequestRepo.generateLeaveStockForNewType(leaveType);
      }

      return leaveType;
    } catch (exception) {
      Logger.log(exception);
      await queryRunner.rollbackTransaction();
      handleResourceConflictException(exception, leaveConstraint);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    pagination: PaginationLeaveRequestTypeDto
  ): Promise<PaginationResponse<LeaveType>> {
    return await this.leaveTypeRepo.findAllWithPagination(
      pagination,
      ['leaveTypeName'],
      {
        relation: { leaveTypeVariation: true, coverFrom: true },
        select: {
          coverFrom: {
            id: true,
            leaveTypeName: true,
            incrementRule: true,
            incrementAllowance: true,
            requiredDoc: true,
            carryForwardStatus: true,
            carryForwardAllowance: true
          }
        },
        orderBy: {
          priority: 'ASC'
        }
      }
    );
  }

  async exportFile(
    pagination: PaginationLeaveRequestTypeDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.LEAVE_REQUEST_TYPE,
      exportFileDto,
      data
    );
  }

  async findOne(id: number): Promise<LeaveType> {
    return await this.leaveTypeRepo.getLeaveTypeById(id);
  }

  async update(
    id: number,
    updateLeaveRequestTypeDto: UpdateLeaveRequestTypeDto
  ): Promise<LeaveType> {
    try {
      const leaveRequestType = await this.leaveTypeRepo.getLeaveTypeById(id);

      //Priority start from 1
      if (updateLeaveRequestTypeDto.priority <= 0) {
        throw new ResourceBadRequestException(
          'priority',
          'priority must be greater than 0'
        );
      }

      const currentPriority: number = leaveRequestType.priority;
      const targetInfo = await this.leaveTypeRepo.findOne({
        where: { priority: updateLeaveRequestTypeDto.priority }
      });
      //Set target priority to null
      if (targetInfo) {
        targetInfo.priority = null;
        await this.leaveTypeRepo.save(targetInfo);
      }

      const leaveTypeEntity = this.leaveTypeRepo.create(
        Object.assign(leaveRequestType, updateLeaveRequestTypeDto)
      );

      await this.leaveTypeRepo.save(leaveTypeEntity);

      //Case move up
      if (currentPriority > updateLeaveRequestTypeDto.priority) {
        await this.leaveTypeRepo.query(`
          UPDATE leave_type SET priority = priority + 1 WHERE priority > ${updateLeaveRequestTypeDto.priority} AND priority < ${currentPriority};
        `);
        await this.leaveTypeRepo.query(`
          UPDATE leave_type SET priority = ${updateLeaveRequestTypeDto.priority} + 1 WHERE priority isnull;
        `);
      }
      //Case move down
      else if (currentPriority < updateLeaveRequestTypeDto.priority) {
        await this.leaveTypeRepo.query(`
          UPDATE leave_type SET priority = priority - 1 WHERE priority < ${updateLeaveRequestTypeDto.priority} AND priority > ${currentPriority};
        `);
        await this.leaveTypeRepo.query(`
          UPDATE leave_type SET priority = ${updateLeaveRequestTypeDto.priority} - 1 WHERE priority isnull;
        `);
      }

      const notDeletedLeaveTypeVariationIds = [];
      for (const leaveTypeVariation of updateLeaveRequestTypeDto.leaves) {
        const leaveTypeVariationEntity = this.leaveTypeVariationRepo.create({
          ...leaveTypeVariation,
          genderId: { id: leaveTypeVariation.gender },
          leaveType: {
            id: leaveRequestType.id,
            coverFrom: { id: updateLeaveRequestTypeDto.coverFrom }
          }
        });

        const newLeaveTypeVariation = await this.leaveTypeVariationRepo.save(
          leaveTypeVariationEntity
        );

        notDeletedLeaveTypeVariationIds.push(newLeaveTypeVariation.id);
      }

      await this.leaveTypeVariationRepo.deleteLeaveTypeVariationByLeaveTypeId(
        leaveRequestType.id,
        notDeletedLeaveTypeVariationIds
      );

      return leaveRequestType;
    } catch (exception) {
      handleResourceConflictException(exception, leaveConstraint);
    }
  }

  async delete(id: number): Promise<void> {
    const leaveRequestType = await this.leaveTypeRepo.getLeaveTypeById(id);
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      for (const variation of leaveRequestType.leaveTypeVariation) {
        const { id } =
          await this.leaveTypeVariationRepo.getLeaveTypeVariationById(
            variation.id
          );
        await queryRunner.manager.delete(LeaveTypeVariation, { id });
      }
      await queryRunner.manager.delete(LeaveType, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findLeaveTypeByEmployee(id: number) {
    const employee = await this.employeeRepo.getEmployeeById(id);
    return await this.leaveTypeVariationRepo.getLeaveTypeVariationByEmployee(
      employee
    );
  }

  async generateStockForLeaveType(id: number, date: string): Promise<void> {
    const leaveType: LeaveType = await this.leaveTypeRepo.getLeaveTypeById(id);

    return await this.leaveRequestRepo.generateLeaveStockForNewType(
      leaveType,
      date
    );
  }

  private validateSpecialAllowanceDay(
    specialAllowanceDay: number,
    allowancePerYear: number
  ): void {
    if (specialAllowanceDay > allowancePerYear) {
      throw new ResourceBadRequestException(
        'Leave request',
        'Special allowance day must not be greater than allowance per year.'
      );
    }
  }
}
