import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, ILike, Repository } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { Employee } from '../employee/entity/employee.entity';
import { CodeValue } from '../key-value/entity';
import { ValidateEmployeeService } from '../employee/validation.service';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeeEmergencyContactConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateEmployeeEmergencyContactDto } from './dto/create-employee-emergency-contact.dto';
import { PaginationEmployeeEmergencyContactDto } from './dto/pagination-employee-emergency-contact.dto';
import { UpdateEmployeeEmergencyContactDto } from './dto/update-employee-emergency-contact.dto';
import {
  EmployeeEmergencyContact,
  employeeEmergencySearchableColumns
} from './entities/employee-emergency-contact.entity';

@Injectable()
export class EmployeeEmergencyContactService {
  private readonly EMPLOYEE = 'employee';

  private readonly EMPLOYEE_EMERGENCY_CONTACT = 'employee emergency contact';

  private readonly CODE_VALUE = 'code value';

  constructor(
    @InjectRepository(EmployeeEmergencyContact)
    private readonly employeeEmergencyContactRepo: Repository<EmployeeEmergencyContact>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(CodeValue)
    private readonly codeValue: Repository<CodeValue>,
    private readonly validateEmployeeService: ValidateEmployeeService
  ) {}

  async checkEmployeeAndCodeValue(employeeId: number, codeValueId?: number) {
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
    const codeValue = await this.codeValue.findOne({
      where: { id: codeValueId }
    });

    if (!codeValue) {
      throw new ResourceNotFoundException(this.CODE_VALUE, codeValue.id);
    }
    return employee;
  }

  async create(
    employeeId: number,
    createEmployeeEmergencyContactDto: CreateEmployeeEmergencyContactDto
  ): Promise<EmployeeEmergencyContact> {
    try {
      await this.checkEmployeeAndCodeValue(
        employeeId,
        createEmployeeEmergencyContactDto.contactRelationshipId
      );
      const employeeEmergencyContact = this.employeeEmergencyContactRepo.create(
        {
          contact: createEmployeeEmergencyContactDto.contact,
          employeeId: { id: employeeId },
          contactRelationship: {
            id: createEmployeeEmergencyContactDto.contactRelationshipId || null
          }
        }
      );
      return await this.employeeEmergencyContactRepo.save(
        employeeEmergencyContact
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeEmergencyContactConstraint,
        createEmployeeEmergencyContactDto
      );
    }
  }

  private selectQuery = () => ({
    contactRelationship: {
      id: true,
      value: true
    },
    employeeId: {
      id: true,
      displayFullNameKh: true,
      displayFullNameEn: true
    }
  });

  private selectRelation = () =>
    ({
      contactRelationship: true,
      employeeId: true
    }) as FindOptionsRelations<EmployeeEmergencyContact>;

  private conditionQuery = (
    pagination: PaginationEmployeeEmergencyContactDto,
    employeeId: number
  ) => ({
    contactRelationship: {
      id: pagination.contactRelationshipId,
      value: pagination.value ? ILike(`%${pagination.value}%`) : null
    },
    employeeId: {
      id: employeeId,
      displayFullNameKh: pagination.displayFullNameKh
        ? ILike(`%${pagination.displayFullNameKh}%`)
        : null,
      displayFullNameEn: pagination.displayFullNameEn
        ? ILike(`%${pagination.displayFullNameEn}%`)
        : null
    }
  });

  async findAll(
    pagination: PaginationEmployeeEmergencyContactDto,
    employeeId: number
  ): Promise<PaginationResponse<EmployeeEmergencyContact>> {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );
    return GetPagination(
      this.employeeEmergencyContactRepo,
      pagination,
      employeeEmergencySearchableColumns,
      {
        where: this.conditionQuery(pagination, employee.id),
        select: this.selectQuery(),
        relation: this.selectRelation()
      }
    );
  }

  async findOne(
    id: number,
    employeeId: number
  ): Promise<EmployeeEmergencyContact> {
    await this.checkEmployeeAndCodeValue(employeeId);
    const employeeEmergencyContact =
      await this.employeeEmergencyContactRepo.findOne({
        where: { id: id, employeeId: { id: employeeId } },
        relations: this.selectRelation(),
        select: this.selectQuery()
      });
    if (!employeeEmergencyContact) {
      throw new ResourceNotFoundException(this.EMPLOYEE_EMERGENCY_CONTACT, id);
    }
    return employeeEmergencyContact;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeEmergencyContactDto: UpdateEmployeeEmergencyContactDto
  ) {
    try {
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

      const codeValue = await this.codeValue.findOne({
        where: {
          id: updateEmployeeEmergencyContactDto.contactRelationshipId
        }
      });
      if (!codeValue) {
        throw new ResourceNotFoundException(
          this.CODE_VALUE,
          updateEmployeeEmergencyContactDto.contactRelationshipId
        );
      }

      const employeeEmergencyContact =
        await this.employeeEmergencyContactRepo.findOne({
          where: {
            id
          }
        });

      if (!employeeEmergencyContact) {
        throw new ResourceNotFoundException(
          this.EMPLOYEE_EMERGENCY_CONTACT,
          id
        );
      }

      const updateEmployeeEmergencyContact = Object.assign(
        employeeEmergencyContact,
        {
          contact: updateEmployeeEmergencyContactDto.contact,
          employeeId: employee.id,
          contactRelationship: codeValue.id
        }
      );
      return await this.employeeEmergencyContactRepo.save(
        updateEmployeeEmergencyContact
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeeEmergencyContactConstraint,
        updateEmployeeEmergencyContactDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeeEmergencyContactRepo.delete(id);
  }
}
