import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { Employee } from '../employee/entity/employee.entity';
import { Code, CodeValue } from '../key-value/entity';
import { ValidateEmployeeService } from '../employee/validation.service';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeLanguageConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { LanguageEnum } from './common/ts/enum/language.enum';
import { CreateEmployeeLanguageDto } from './dto/create-employee-language.dto';
import { PaginationEmployeeLanguageDto } from './dto/pagination-employee-language.dto';
import { UpdateEmployeeLanguageDto } from './dto/update-employee-language.dto';
import { EmployeeLanguage } from './entities/employee-language.entity';

@Injectable()
export class EmployeeLanguageService {
  private readonly CODE_VALUE = 'code value';

  private readonly EMPLOYEE = 'employee';

  private readonly EMPLOYEE_LANGUAGE = 'employee language';

  private readonly LANGUAGE = 'LANGUAGE';

  constructor(
    @InjectRepository(EmployeeLanguage)
    private readonly employeeLanguageRepo: Repository<EmployeeLanguage>,
    @InjectRepository(CodeValue)
    private readonly codeValueRepo: Repository<CodeValue>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,
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
      where: { id: codeValueId },
      relations: { code: true }
    });
    if (!codeValue) {
      throw new ResourceNotFoundException(this.CODE_VALUE, codeValueId);
    }
    const code = await this.codeRepo.findOne({
      where: { id: codeValue.code.id }
    });
    if (code.code !== Object.values(LanguageEnum).toString()) {
      throw new ResourceNotFoundException(
        `Resource of Code value does not match with code of${this.LANGUAGE}`
      );
    }
  }

  async create(
    employeeId: number,
    createEmployeeLanguageDto: CreateEmployeeLanguageDto
  ): Promise<EmployeeLanguage> {
    try {
      await this.checkEmployeeAndCodeValue(
        employeeId,
        createEmployeeLanguageDto.languageId
      );
      const employeeLanguage = this.employeeLanguageRepo.create({
        employeeId: { id: employeeId },
        languageId: { id: createEmployeeLanguageDto.languageId }
      });
      return await this.employeeLanguageRepo.save(employeeLanguage);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeLanguageConstraint,
        createEmployeeLanguageDto
      );
    }
  }

  async findAll(
    pagination: PaginationEmployeeLanguageDto,
    employeeId: number
  ): Promise<PaginationResponse<EmployeeLanguage>> {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );
    return GetPagination(this.employeeLanguageRepo, pagination, [], {
      where: {
        languageId: {
          id: pagination.languageId,
          value: pagination.value ? ILike(`%${pagination.value}%`) : null
        },
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
      relation: { languageId: true, employeeId: true },
      select: {
        languageId: { id: true, value: true },
        employeeId: {
          id: true,
          displayFullNameKh: true,
          displayFullNameEn: true
        }
      }
    });
  }

  async findOne(id: number, employeeId: number): Promise<EmployeeLanguage> {
    await this.checkEmployeeAndCodeValue(employeeId);
    const employeeLanguage = await this.employeeLanguageRepo.findOne({
      where: { id: id },
      relations: { languageId: true, employeeId: true },
      select: {
        languageId: { id: true, value: true },
        employeeId: {
          id: true,
          displayFullNameKh: true,
          displayFullNameEn: true
        }
      }
    });
    if (!employeeLanguage) {
      throw new ResourceNotFoundException(this.EMPLOYEE_LANGUAGE, id);
    }
    return employeeLanguage;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeLanguageDto: UpdateEmployeeLanguageDto
  ): Promise<EmployeeLanguage & UpdateEmployeeLanguageDto> {
    try {
      const employeeLanguage = await this.findOne(id, employeeId);
      await this.checkEmployeeAndCodeValue(
        employeeId,
        updateEmployeeLanguageDto.languageId
      );
      return await this.employeeLanguageRepo.save(
        Object.assign(employeeLanguage, updateEmployeeLanguageDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeLanguageConstraint,
        updateEmployeeLanguageDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeLanguageRepo.delete(id);
  }
}
