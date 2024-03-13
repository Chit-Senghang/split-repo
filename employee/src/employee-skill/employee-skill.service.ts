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
import { employeeSkillConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CodeEnum } from './common/ts/enum/code.enum';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { PaginationEmployeeSkillDto } from './dto/pagination-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';
import { EmployeeSkill } from './entities/employee-skill.entity';

@Injectable()
export class EmployeeSkillService {
  private readonly CODE_VALUE = 'code value';

  private readonly EMPLOYEE = 'employee';

  private readonly EMPLOYEE_SKILL = 'employee skill';

  constructor(
    @InjectRepository(EmployeeSkill)
    private readonly employeeSkillRepo: Repository<EmployeeSkill>,
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
      throw new ResourceNotFoundException(
        `You should choose ${this.EMPLOYEE} at less one`
      );
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
    if (code.code !== Object.values(CodeEnum).toString()) {
      throw new ResourceNotFoundException(
        'Resource of Code value does not match with code of SKILL'
      );
    }
  }

  async create(
    employeeId: number,
    createEmployeeSkillDto: CreateEmployeeSkillDto
  ): Promise<EmployeeSkill> {
    try {
      await this.checkEmployeeAndCodeValue(
        employeeId,
        createEmployeeSkillDto.skillId
      );
      const employeeSkill = this.employeeSkillRepo.create({
        employeeId: { id: employeeId },
        skillId: { id: createEmployeeSkillDto.skillId }
      });
      return await this.employeeSkillRepo.save(employeeSkill);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeSkillConstraint,
        createEmployeeSkillDto
      );
    }
  }

  async findAll(
    pagination: PaginationEmployeeSkillDto,
    employeeId: number
  ): Promise<PaginationResponse<EmployeeSkill>> {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );
    return GetPagination(this.employeeSkillRepo, pagination, [], {
      where: {
        skillId: {
          id: pagination.skillId,
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
      relation: { skillId: true, employeeId: true },
      select: {
        skillId: { id: true, value: true },
        employeeId: {
          id: true,
          displayFullNameKh: true,
          displayFullNameEn: true
        }
      }
    });
  }

  async findOne(id: number, employeeId: number): Promise<EmployeeSkill> {
    await this.checkEmployeeAndCodeValue(employeeId);
    const employeeSkill = await this.employeeSkillRepo.findOne({
      where: { id: id },
      relations: { skillId: true, employeeId: true },
      select: {
        skillId: { id: true, value: true },
        employeeId: {
          id: true,
          displayFullNameKh: true,
          displayFullNameEn: true
        }
      }
    });
    if (!employeeSkill) {
      throw new ResourceNotFoundException(this.EMPLOYEE_SKILL, id);
    }
    return employeeSkill;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeSkillDto: UpdateEmployeeSkillDto
  ): Promise<EmployeeSkill & UpdateEmployeeSkillDto> {
    try {
      const employeeSkill = await this.findOne(id, employeeId);
      await this.checkEmployeeAndCodeValue(
        employeeId,
        updateEmployeeSkillDto.skillId
      );
      return await this.employeeSkillRepo.save(
        Object.assign(employeeSkill, updateEmployeeSkillDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeSkillConstraint,
        updateEmployeeSkillDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeSkillRepo.delete(id);
  }
}
