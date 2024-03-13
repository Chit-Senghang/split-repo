import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { EmployeeRepository } from '../employee/repository/employee.repository';
import { IEmployeeRepository } from '../employee/repository/interface/employee.repository.interface';
import { Employee } from '../employee/entity/employee.entity';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeContactConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateEmployeeContactDto } from './dto/create-employee-contact.dto';
import { EmployeeContactPagination } from './dto/pagination-employee-contact.dto';
import { UpdateEmployeeContactDto } from './dto/update-employee-contact.dto';
import { EmployeeContact } from './entities/employee-contact.entity';

@Injectable()
export class EmployeeContactService {
  private readonly EMPLOYEE_CONTACT = 'employee contact';

  constructor(
    @InjectRepository(EmployeeContact)
    private readonly employeeContactRepo: Repository<EmployeeContact>,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  async create(
    employeeId: number,
    createEmployeeContactDto: CreateEmployeeContactDto
  ): Promise<EmployeeContact> {
    try {
      const employee = await this.employeeRepo.getEmployeeById(employeeId);
      const employeeContact = this.employeeContactRepo.create({
        contact: createEmployeeContactDto.contact,
        isDefault: createEmployeeContactDto.isDefault,
        countryCode: createEmployeeContactDto.countryCode,
        employee: {
          id: employee.id
        }
      });
      return await this.employeeContactRepo.save(employeeContact);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeContactConstraint,
        createEmployeeContactDto
      );
    }
  }

  async findAll(
    pagination: EmployeeContactPagination,
    employeeId: number
  ): Promise<PaginationResponse<EmployeeContact>> {
    const employee: Employee =
      await this.employeeRepo.getEmployeeById(employeeId);
    return GetPagination(this.employeeContactRepo, pagination, ['contact'], {
      select: {
        employee: {
          id: true,
          firstNameKh: true,
          lastNameKh: true,
          firstNameEn: true,
          lastNameEn: true,
          displayFullNameKh: true,
          displayFullNameEn: true
        }
      },
      where: {
        employee: {
          id: employee.id,
          firstNameKh: pagination.firstNameKh
            ? ILike(`%${pagination.firstNameKh}%`)
            : null,
          lastNameKh: pagination.lastNameKh
            ? ILike(`%${pagination.lastNameKh}%`)
            : null,
          firstNameEn: pagination.firstNameEn
            ? ILike(`%${pagination.firstNameEn}%`)
            : null,
          lastNameEn: pagination.lastNameEn
            ? ILike(`%${pagination.lastNameEn}%`)
            : null,

          displayFullNameKh: pagination.displayFullNameKh
            ? ILike(`%${pagination.displayFullNameKh}%`)
            : null,
          displayFullNameEn: pagination.displayFullNameEn
            ? ILike(`%${pagination.displayFullNameEn}%`)
            : null
        }
      },
      relation: {
        employee: true
      }
    });
  }

  async findOne(id: number, employeeId: number): Promise<EmployeeContact> {
    await this.employeeRepo.getEmployeeById(employeeId);

    const employeeContact = await this.employeeContactRepo.findOne({
      select: {
        employee: {
          id: true,
          firstNameKh: true,
          lastNameKh: true,
          firstNameEn: true,
          lastNameEn: true,
          displayFullNameKh: true,
          displayFullNameEn: true
        }
      },
      where: { id: id, employee: { id: employeeId } },
      relations: {
        employee: true
      }
    });
    if (!employeeContact) {
      throw new ResourceNotFoundException(this.EMPLOYEE_CONTACT, id);
    }
    return employeeContact;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeContactDto: UpdateEmployeeContactDto
  ): Promise<EmployeeContact> {
    try {
      const employeeContact = await this.findOne(id, employeeId);
      return await this.employeeContactRepo.save(
        Object.assign(employeeContact, updateEmployeeContactDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeContactConstraint,
        updateEmployeeContactDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeContactRepo.delete(id);
  }
}
