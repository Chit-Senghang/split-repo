import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  ILike,
  FindOptionsSelect,
  FindOptionsRelations
} from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { Employee } from '../employee/entity/employee.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { ValidateEmployeeService } from '../employee/validation.service';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeInsuranceConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateEmployeeInsuranceDto } from './dto/create-employee-insurance.dto';
import { PaginationEmployeeInsurance } from './dto/pagination-employee-insurance.dto';
import { UpdateEmployeeInsuranceDto } from './dto/update-employee-insurance.dto';
import { EmployeeInsurance } from './entities/employee-insurance.entity';

@Injectable()
export class EmployeeInsuranceService {
  private readonly EMPLOYEE_INSURANCE = 'employee insurance';

  private readonly EMPLOYEE = 'employee';

  private readonly INSURANCE = 'insurance';

  constructor(
    @InjectRepository(EmployeeInsurance)
    private readonly employeeInsuranceRepo: Repository<EmployeeInsurance>,
    @InjectRepository(Insurance)
    private readonly insuranceRepo: Repository<Insurance>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly validateEmployeeService: ValidateEmployeeService
  ) {}

  async checkEmployeeAndInsurance(employeeId: number, insuranceId?: number) {
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
    if (!insuranceId) {
      return;
    }
    const insurance = await this.insuranceRepo.findOne({
      where: { id: insuranceId }
    });
    if (!insurance) {
      throw new ResourceNotFoundException(this.EMPLOYEE_INSURANCE, insuranceId);
    }
  }

  async create(
    employeeId: number,
    createEmployeeInsuranceDto: CreateEmployeeInsuranceDto
  ): Promise<EmployeeInsurance> {
    try {
      await this.checkEmployeeAndInsurance(
        employeeId,
        createEmployeeInsuranceDto.insuranceId
      );
      const employeeInsurance = this.employeeInsuranceRepo.create({
        cardNumber: createEmployeeInsuranceDto.cardNumber,
        insuranceId: { id: createEmployeeInsuranceDto.insuranceId },
        employeeId: { id: employeeId }
      });
      return this.employeeInsuranceRepo.save(employeeInsurance);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeInsuranceConstraint,
        createEmployeeInsuranceDto
      );
    }
  }

  async findAll(
    pagination: PaginationEmployeeInsurance,
    employeeId: number
  ): Promise<PaginationResponse<EmployeeInsurance>> {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );
    const { searchDisplayNameKh, searchDisplayNameEn } =
      this.searchByDisplayNameFullName(pagination);

    return GetPagination(this.employeeInsuranceRepo, pagination, [], {
      where: {
        insuranceId: { id: pagination.insuranceId },
        cardNumber: pagination.cardNumber,
        employeeId: {
          id: employee.id,
          displayFullNameKh: searchDisplayNameKh,
          displayFullNameEn: searchDisplayNameEn
        }
      },
      relation: this.selectRelation(),
      select: this.selectQuery()
    });
  }

  searchByDisplayNameFullName(pagination: PaginationEmployeeInsurance) {
    let searchDisplayNameKh, searchDisplayNameEn;
    if (pagination) {
      searchDisplayNameKh = pagination.displayFullNameKh
        ? ILike(`%${pagination.displayFullNameKh}%`)
        : null;
      searchDisplayNameEn = pagination.displayFullNameKh
        ? ILike(`%${pagination.displayFullNameKh}%`)
        : null;
    }
    return {
      searchDisplayNameKh,
      searchDisplayNameEn
    };
  }

  async findOne(id: number, employeeId: number): Promise<EmployeeInsurance> {
    await this.checkEmployeeAndInsurance(employeeId);
    const employeeInsurance = await this.employeeInsuranceRepo.findOne({
      where: { id: id, employeeId: { id: employeeId } },
      select: this.selectQuery(),
      relations: this.selectRelation()
    });
    if (!employeeInsurance) {
      throw new ResourceNotFoundException(this.EMPLOYEE_INSURANCE, id);
    }
    return employeeInsurance;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeInsuranceDto: UpdateEmployeeInsuranceDto
  ): Promise<EmployeeInsurance & UpdateEmployeeInsuranceDto> {
    try {
      await this.checkEmployeeAndInsurance(
        employeeId,
        updateEmployeeInsuranceDto.insuranceId
      );
      const employeeInsurance = await this.findOne(id, employeeId);
      return await this.employeeInsuranceRepo.save(
        Object.assign(employeeInsurance, updateEmployeeInsuranceDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeInsuranceConstraint,
        updateEmployeeInsuranceDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeInsuranceRepo.delete(id);
  }

  private selectQuery = () =>
    ({
      id: true,
      cardNumber: true,
      insuranceId: {
        id: true,
        name: true
      },
      employeeId: {
        id: true,
        displayFullNameEn: true,
        displayFullNameKh: true
      }
    }) as FindOptionsSelect<EmployeeInsurance>;

  private selectRelation = () =>
    ({
      insuranceId: true,
      employeeId: true
    }) as FindOptionsRelations<EmployeeInsurance>;
}
