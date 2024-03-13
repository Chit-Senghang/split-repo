import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  Repository
} from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { Employee } from '../employee/entity/employee.entity';
import { CodeValue } from '../key-value/entity';
import { validateDateTime } from '../shared-resources/utils/validate-date-format';
import { ValidateEmployeeService } from '../employee/validation.service';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeIdentifierConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateEmployeeIdentifierDto } from './dto/create-employee-identifier.dto';
import { PaginationEmployeeIdentifierDto } from './dto/pagination-employee-identifier.dto';
import { UpdateEmployeeIdentifierDto } from './dto/update-employee-identifier.dto';
import {
  EmployeeIdentifier,
  employeeIdentificationSearchableColumns
} from './entities/employee-identifier.entity';

@Injectable()
export class EmployeeIdentifierService {
  private readonly CODE_VALUE = 'code value';

  private readonly EMPLOYEE = 'employee';

  private readonly EMPLOYEE_IDENTIFIER = 'employee identifier';

  constructor(
    @InjectRepository(EmployeeIdentifier)
    private readonly employeeIdentifierRepo: Repository<EmployeeIdentifier>,
    @InjectRepository(CodeValue)
    private readonly codeValueRepo: Repository<CodeValue>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly validateEmployeeService: ValidateEmployeeService
  ) {}

  async checkEmployeeAndCodeValue(
    employeeId: number,
    codeValueId: number = null
  ) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,
        positions: {
          isMoved: false
        }
      }
    });
    if (!employee) {
      throw new ResourceNotFoundException(this.EMPLOYEE, employeeId);
    }
    if (!codeValueId) {
      return;
    }
    const codeValue = await this.codeValueRepo.findOne({
      where: { id: codeValueId }
    });
    if (!codeValue) {
      throw new ResourceNotFoundException(this.CODE_VALUE, codeValueId);
    }
  }

  async create(
    employeeId: number,
    createEmployeeIdentifierDto: CreateEmployeeIdentifierDto
  ) {
    try {
      await this.checkEmployeeAndCodeValue(
        employeeId,
        createEmployeeIdentifierDto.documentTypeId
      );
      const expireDate = createEmployeeIdentifierDto.expireDate
        ? validateDateTime(createEmployeeIdentifierDto.expireDate)
        : null;
      const employeeIdentifier = this.employeeIdentifierRepo.create({
        employeeId: { id: employeeId },
        documentTypeId: { id: createEmployeeIdentifierDto.documentTypeId },
        documentIdentifier: createEmployeeIdentifierDto.documentIdentifier,
        expireDate,
        description: createEmployeeIdentifierDto.description || null
      });

      return await this.employeeIdentifierRepo.save(employeeIdentifier);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeIdentifierConstraint,
        createEmployeeIdentifierDto
      );
    }
  }

  private selectRelation = () =>
    ({
      documentTypeId: true,
      employeeId: true
    }) as FindOptionsRelations<EmployeeIdentifier>;

  private selectQuery = () =>
    ({
      documentTypeId: { id: true, value: true },
      employeeId: {
        id: true,
        displayFullNameKh: true,
        displayFullNameEn: true
      }
    }) as FindOptionsSelect<EmployeeIdentifier>;

  private conditionQuery = (
    pagination: PaginationEmployeeIdentifierDto,
    employeeId: number
  ) =>
    ({
      documentTypeId: { id: pagination.documentTypeId },
      documentIdentifier: pagination.documentIdentifier,
      expireDate: pagination.expireDate,
      employeeId: {
        id: employeeId,
        displayFullNameKh: pagination.displayFullNameKh
          ? ILike(`%${pagination.displayFullNameKh}%`)
          : null,
        displayFullNameEn: pagination.displayFullNameEn
          ? ILike(`%${pagination.displayFullNameEn}%`)
          : null
      }
    }) as FindOptionsWhere<EmployeeIdentifier>;

  async findAll(
    pagination: PaginationEmployeeIdentifierDto,
    employeeId: number
  ): Promise<PaginationResponse<EmployeeIdentifier>> {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );
    return GetPagination(
      this.employeeIdentifierRepo,
      pagination,
      employeeIdentificationSearchableColumns,
      {
        where: this.conditionQuery(pagination, employee.id),
        relation: this.selectRelation(),
        select: this.selectQuery()
      }
    );
  }

  async findOne(id: number, employeeId: number): Promise<EmployeeIdentifier> {
    await this.checkEmployeeAndCodeValue(employeeId);
    const employeeIdentifier = await this.employeeIdentifierRepo.findOne({
      where: { id: id },
      relations: this.selectRelation(),
      select: this.selectQuery()
    });
    if (!employeeIdentifier) {
      throw new ResourceNotFoundException(this.EMPLOYEE_IDENTIFIER, id);
    }
    return employeeIdentifier;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeIdentifierDto: UpdateEmployeeIdentifierDto
  ): Promise<EmployeeIdentifier & UpdateEmployeeIdentifierDto> {
    try {
      const employeeIdentifier = await this.findOne(id, employeeId);
      await this.checkEmployeeAndCodeValue(
        employeeId,
        updateEmployeeIdentifierDto.documentTypeId
      );
      return await this.employeeIdentifierRepo.save(
        Object.assign(employeeIdentifier, {
          ...updateEmployeeIdentifierDto,
          expireDate: updateEmployeeIdentifierDto.expireDate
            ? validateDateTime(updateEmployeeIdentifierDto.expireDate)
            : employeeIdentifier.expireDate
        })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeIdentifierConstraint,
        updateEmployeeIdentifierDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeIdentifierRepo.delete(id);
  }
}
