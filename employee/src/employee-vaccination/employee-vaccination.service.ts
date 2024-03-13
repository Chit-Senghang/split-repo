import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { Employee } from '../employee/entity/employee.entity';
import { Vaccination } from '../vaccination/entities/vaccination.entity';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeVaccinationConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateEmployeeVaccinationDto } from './dto/create-employee-vaccination.dto';
import { PaginationEmployeeVaccinationDto } from './dto/pagination-employee-vaccination.dto';
import { UpdateEmployeeVaccinationDto } from './dto/update-employee-vaccination.dto';
import { EmployeeVaccination } from './entities/employee-vaccination.entity';

@Injectable()
export class EmployeeVaccinationService {
  private readonly VACCINATION = 'vaccination';

  private readonly EMPLOYEE = 'employee';

  private readonly EMPLOYEE_VACCINATION = 'employee vaccination';

  constructor(
    @InjectRepository(EmployeeVaccination)
    private readonly employeeVaccinationRepo: Repository<EmployeeVaccination>,
    @InjectRepository(Vaccination)
    private readonly vaccinationRepo: Repository<Vaccination>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>
  ) {}

  async checkEmployeeAndVaccination(
    employeeId: number,
    vaccinationId: number = null
  ) {
    const employee = await this.employeeRepo.findOne({
      where: {
        id: employeeId,
        positions: {
          isMoved: true
        }
      }
    });
    if (!employee) {
      throw new ResourceNotFoundException(this.EMPLOYEE, employeeId);
    }
    if (!vaccinationId) {
      return;
    }
    const vaccination = await this.vaccinationRepo.findOne({
      where: { id: vaccinationId }
    });
    if (!vaccination) {
      throw new ResourceNotFoundException(this.VACCINATION, vaccinationId);
    }
  }

  async create(
    employeeId: number,
    createEmployeeVaccinationDto: CreateEmployeeVaccinationDto
  ): Promise<EmployeeVaccination> {
    try {
      await this.checkEmployeeAndVaccination(
        employeeId,
        createEmployeeVaccinationDto.vaccinationId
      );
      const employeeVaccination = this.employeeVaccinationRepo.create({
        employeeId: { id: employeeId },
        cardNumber: createEmployeeVaccinationDto.cardNumber,
        vaccinationId: { id: createEmployeeVaccinationDto.vaccinationId }
      });
      return await this.employeeVaccinationRepo.save(employeeVaccination);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeVaccinationConstraint,
        createEmployeeVaccinationDto
      );
    }
  }

  async findAll(
    employeeId: number,
    pagination: PaginationEmployeeVaccinationDto
  ): Promise<PaginationResponse<EmployeeVaccination>> {
    await this.checkEmployeeAndVaccination(employeeId);
    return GetPagination(this.employeeVaccinationRepo, pagination, [], {
      where: {
        vaccinationId: { id: pagination.vaccinationId },
        cardNumber: pagination.cardNumber,
        employeeId: {
          id: pagination.employeeId ? pagination.employeeId : null
        }
      },
      relation: { vaccinationId: true, employeeId: true },
      select: {
        vaccinationId: { id: true, name: true },
        employeeId: {
          id: true,
          displayFullNameEn: true,
          displayFullNameKh: true
        }
      }
    });
  }

  async findOne(id: number, employeeId: number): Promise<EmployeeVaccination> {
    await this.checkEmployeeAndVaccination(employeeId);
    const employeeBackAccount = await this.employeeVaccinationRepo.findOne({
      where: { id: id },
      relations: { vaccinationId: true },
      select: { vaccinationId: { id: true, name: true } }
    });
    if (!employeeBackAccount) {
      throw new ResourceNotFoundException(this.EMPLOYEE_VACCINATION, id);
    }
    return employeeBackAccount;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeVaccinationDto: UpdateEmployeeVaccinationDto
  ): Promise<EmployeeVaccination & UpdateEmployeeVaccinationDto> {
    try {
      const EmployeeVaccination = await this.findOne(id, employeeId);
      await this.checkEmployeeAndVaccination(
        employeeId,
        updateEmployeeVaccinationDto.vaccinationId
      );
      return await this.employeeVaccinationRepo.save(
        Object.assign(EmployeeVaccination, updateEmployeeVaccinationDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeVaccinationConstraint,
        updateEmployeeVaccinationDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeVaccinationRepo.delete(id);
  }
}
