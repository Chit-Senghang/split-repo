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
import { employeeTrainingConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { TrainingCodeEnum } from './common/ts/enum/training-type.enum';
import { CreateEmployeeTrainingDto } from './dto/create-employee-training.dto';
import { PaginationEmployeeTrainingDto } from './dto/pagination-employee-training.dto';
import { UpdateEmployeeTrainingDto } from './dto/update-employee-training.dto';
import { EmployeeTraining } from './entities/employee-training.entity';

@Injectable()
export class EmployeeTrainingService {
  private readonly CODE_VALUE = 'code value';

  private readonly EMPLOYEE = 'employee';

  private readonly EMPLOYEE_TRAINING = 'employee training';

  private readonly TRAINING = 'training';

  constructor(
    @InjectRepository(EmployeeTraining)
    private readonly employeeTrainingRepo: Repository<EmployeeTraining>,
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
    if (code.code !== Object.values(TrainingCodeEnum).toString()) {
      throw new ResourceNotFoundException(
        `Resource of Code value does not match with code of ${this.TRAINING}`
      );
    }
  }

  async create(
    employeeId: number,
    createEmployeeTrainingDto: CreateEmployeeTrainingDto
  ): Promise<EmployeeTraining> {
    try {
      await this.checkEmployeeAndCodeValue(
        employeeId,
        createEmployeeTrainingDto.trainingId
      );
      const employeeTraining = this.employeeTrainingRepo.create({
        employeeId: { id: employeeId },
        trainingId: { id: createEmployeeTrainingDto.trainingId }
      });
      return await this.employeeTrainingRepo.save(employeeTraining);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeTrainingConstraint,
        createEmployeeTrainingDto
      );
    }
  }

  async findAll(
    pagination: PaginationEmployeeTrainingDto,
    employeeId: number
  ): Promise<PaginationResponse<EmployeeTraining>> {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );
    return GetPagination(this.employeeTrainingRepo, pagination, [], {
      where: {
        trainingId: {
          id: pagination.trainingId,
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
      relation: { trainingId: true, employeeId: true },
      select: {
        trainingId: { id: true, value: true },
        employeeId: {
          id: true,
          displayFullNameKh: true,
          displayFullNameEn: true
        }
      }
    });
  }

  async findOne(id: number, employeeId: number): Promise<EmployeeTraining> {
    await this.checkEmployeeAndCodeValue(employeeId);
    const employeeTraining = await this.employeeTrainingRepo.findOne({
      where: { id: id },
      relations: { trainingId: true, employeeId: true },
      select: {
        trainingId: { id: true, value: true },
        employeeId: {
          id: true,
          displayFullNameKh: true,
          displayFullNameEn: true
        }
      }
    });
    if (!employeeTraining) {
      throw new ResourceNotFoundException(this.EMPLOYEE_TRAINING, id);
    }
    return employeeTraining;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeTrainingDto: UpdateEmployeeTrainingDto
  ): Promise<EmployeeTraining & UpdateEmployeeTrainingDto> {
    try {
      const employeeTraining = await this.findOne(id, employeeId);
      await this.checkEmployeeAndCodeValue(
        employeeId,
        updateEmployeeTrainingDto.trainingId
      );
      return await this.employeeTrainingRepo.save(
        Object.assign(employeeTraining, updateEmployeeTrainingDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeTrainingConstraint,
        updateEmployeeTrainingDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeTrainingRepo.delete(id);
  }
}
