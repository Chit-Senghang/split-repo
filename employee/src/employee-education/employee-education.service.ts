import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, Repository, ILike } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { Employee } from '../employee/entity/employee.entity';
import { CodeValue } from '../key-value/entity';
import { ValidateEmployeeService } from '../employee/validation.service';
import { validateDateTime } from '../shared-resources/utils/validate-date-format';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeEducationConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateEmployeeEducationDto } from './dto/create-employee-education.dto';
import { PaginationEmployeeEducationDto } from './dto/pagination-employee-education.dto';
import { UpdateEmployeeEducationDto } from './dto/update-employee-education.dto';
import { EmployeeEducation } from './entities/employee-education.entity';

@Injectable()
export class EmployeeEducationService {
  private readonly CODE_VALUE = 'code value';

  private readonly EMPLOYEE = 'employee';

  private readonly EMPLOYEE_EDUCATION = 'employee education';

  constructor(
    @InjectRepository(EmployeeEducation)
    private readonly employeeEducationRepo: Repository<EmployeeEducation>,
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
    createEmployeeEducationDto: CreateEmployeeEducationDto
  ): Promise<EmployeeEducation> {
    try {
      await this.checkEmployeeAndCodeValue(
        employeeId,
        createEmployeeEducationDto.educationTypeId
      );
      const employeeEducation = this.employeeEducationRepo.create({
        employeeId: { id: employeeId },
        educationTypeId: { id: createEmployeeEducationDto.educationTypeId },
        instituteName: createEmployeeEducationDto.instituteName,
        major: createEmployeeEducationDto.major,
        startDate: createEmployeeEducationDto.startDate
          ? validateDateTime(createEmployeeEducationDto.startDate)
          : null,
        endDate: createEmployeeEducationDto.endDate
          ? validateDateTime(createEmployeeEducationDto.endDate)
          : null
      });
      return await this.employeeEducationRepo.save(employeeEducation);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeEducationConstraint,
        createEmployeeEducationDto
      );
    }
  }

  private selectQuery = () =>
    ({
      educationTypeId: { id: true, value: true },
      employeeId: {
        id: true,
        displayFullNameKh: true,
        displayFullNameEn: true
      }
    }) as FindOptionsSelect<EmployeeEducation>;

  async findAll(
    pagination: PaginationEmployeeEducationDto,
    employeeId: number
  ): Promise<PaginationResponse<EmployeeEducation>> {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );
    return GetPagination(this.employeeEducationRepo, pagination, [], {
      where: {
        educationTypeId: { id: pagination.educationTypeId },
        instituteName: pagination.instituteName,
        startDate: pagination.startDate,
        endDate: pagination.endDate,
        employeeId: {
          id: employee.id,
          displayFullNameKh: pagination.displayFullNameKh
            ? ILike(`%${pagination.displayFullNameKh}%`)
            : null,
          displayFullNameEn: pagination.displayFullNameEn
            ? ILike(`%${pagination.displayFullNameEn}%`)
            : null
        }
      },
      relation: { educationTypeId: true, employeeId: true },
      select: this.selectQuery()
    });
  }

  async findOne(id: number, employeeId: number): Promise<EmployeeEducation> {
    await this.checkEmployeeAndCodeValue(employeeId);
    const employeeEducation = await this.employeeEducationRepo.findOne({
      where: { id: id },
      relations: { educationTypeId: true, employeeId: true },
      // select: { educationTypeId: { id: true, value: true } }
      select: this.selectQuery()
    });
    if (!employeeEducation) {
      throw new ResourceNotFoundException(this.EMPLOYEE_EDUCATION, id);
    }
    return employeeEducation;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeEducationDto: UpdateEmployeeEducationDto
  ): Promise<EmployeeEducation & UpdateEmployeeEducationDto> {
    try {
      const employeeEducation = await this.findOne(id, employeeId);
      await this.checkEmployeeAndCodeValue(
        employeeId,
        updateEmployeeEducationDto.educationTypeId
      );
      return await this.employeeEducationRepo.save(
        Object.assign(employeeEducation, {
          ...updateEmployeeEducationDto,
          startDate: updateEmployeeEducationDto.startDate
            ? (validateDateTime(updateEmployeeEducationDto.startDate) as any)
            : employeeEducation.startDate,
          endDate: updateEmployeeEducationDto.endDate
            ? (validateDateTime(updateEmployeeEducationDto.endDate) as any)
            : employeeEducation.endDate
        })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeEducationConstraint,
        updateEmployeeEducationDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeEducationRepo.delete(id);
  }
}
