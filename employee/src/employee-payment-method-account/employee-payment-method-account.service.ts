import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { Employee } from '../employee/entity/employee.entity';
import { ValidateEmployeeService } from '../employee/validation.service';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { employeePaymentMethodAccountConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateEmployeePaymentMethodAccountDto } from './dto/create-employee-payment-method-account.dto';
import { PaginationEmployeePaymentMethodAccountDto } from './dto/pagination-employee-payment-method-account.dto';
import { UpdateEmployeePaymentMethodAccountDto } from './dto/update-employee-payment-method-account.dto';
import { EmployeePaymentMethodAccount } from './entities/employee-payment-method-account.entity';

@Injectable()
export class EmployeePaymentMethodAccountService {
  private readonly PAYMENT_METHOD = 'payment method';

  private readonly EMPLOYEE = 'employee';

  private readonly EMPLOYEE_PAYMENT_METHOD_ACCOUNT =
    'employee payment method account';

  constructor(
    @InjectRepository(EmployeePaymentMethodAccount)
    private readonly employeePaymentMethodAccountRepo: Repository<EmployeePaymentMethodAccount>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly validateEmployeeService: ValidateEmployeeService
  ) {}

  async checkEmployeeAndPaymentMethod(
    employeeId: number = null,
    paymentMethodId: number = null
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
    const paymentMethod = await this.paymentMethodRepo.findOne({
      where: { id: paymentMethodId }
    });
    if (!paymentMethod) {
      throw new ResourceNotFoundException(this.PAYMENT_METHOD, paymentMethodId);
    }
    return paymentMethod;
  }

  async create(
    employeeId: number,
    createEmployeeBackAccountDto: CreateEmployeePaymentMethodAccountDto
  ): Promise<EmployeePaymentMethodAccount> {
    try {
      const paymentMethod = await this.checkEmployeeAndPaymentMethod(
        employeeId,
        createEmployeeBackAccountDto.paymentMethodId
      );

      if (
        paymentMethod.name !== 'CASH' &&
        !createEmployeeBackAccountDto.accountNumber
      ) {
        throw new ResourceBadRequestException(
          'accountNumber',
          'accountNumber is required'
        );
      }

      if (
        paymentMethod.name === 'CASH' &&
        createEmployeeBackAccountDto.accountNumber
      ) {
        throw new ResourceBadRequestException(
          'accountNumber',
          'accountNumber is not required'
        );
      }

      const employeePaymentMethodAccount =
        this.employeePaymentMethodAccountRepo.create({
          employee: { id: employeeId },
          paymentMethod: { id: createEmployeeBackAccountDto.paymentMethodId },
          accountNumber: createEmployeeBackAccountDto.accountNumber,
          isDefaultAccount: createEmployeeBackAccountDto.isDefaultAccount
        });
      return this.employeePaymentMethodAccountRepo.save(
        employeePaymentMethodAccount
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeePaymentMethodAccountConstraint,
        createEmployeeBackAccountDto
      );
    }
  }

  async findAll(
    pagination: PaginationEmployeePaymentMethodAccountDto,
    employeeId: number
  ): Promise<PaginationResponse<EmployeePaymentMethodAccount>> {
    const employee =
      await this.validateEmployeeService.checkEmployeeByCurrentUserLogin(
        employeeId
      );
    return GetPagination(
      this.employeePaymentMethodAccountRepo,
      pagination,
      [],
      {
        where: {
          accountNumber: pagination.accountNumber
            ? pagination.accountNumber
            : null,
          paymentMethod: {
            id: pagination.paymentMethodId,
            name: pagination.name ? ILike(`%${pagination.name}%`) : null
          },
          employee: {
            id: employee.id,
            displayFullNameKh: pagination.displayFullNameKh
              ? ILike(`%${pagination.displayFullNameKh}%`)
              : null,
            displayFullNameEn: pagination.displayFullNameEn
              ? ILike(`%${pagination.displayFullNameEn}%`)
              : null
          }
        },
        relation: { paymentMethod: true, employee: true },
        select: {
          paymentMethod: { id: true, name: true },
          employee: {
            id: true,
            displayFullNameKh: true,
            displayFullNameEn: true
          }
        }
      }
    );
  }

  async findOne(
    id: number,
    employeeId: number
  ): Promise<EmployeePaymentMethodAccount> {
    await this.checkEmployeeAndPaymentMethod(employeeId);
    const employeeBackAccount =
      await this.employeePaymentMethodAccountRepo.findOne({
        where: { id: id },
        relations: { paymentMethod: true, employee: true },
        select: {
          paymentMethod: { id: true, name: true },
          employee: {
            id: true,
            displayFullNameEn: true,
            displayFullNameKh: true
          }
        }
      });
    if (!employeeBackAccount) {
      throw new ResourceNotFoundException(
        this.EMPLOYEE_PAYMENT_METHOD_ACCOUNT,
        id
      );
    }
    return employeeBackAccount;
  }

  async update(
    id: number,
    employeeId: number,
    updateEmployeeBackAccountDto: UpdateEmployeePaymentMethodAccountDto
  ): Promise<
    EmployeePaymentMethodAccount & UpdateEmployeePaymentMethodAccountDto
  > {
    try {
      const employeePaymentMethodAccount = await this.findOne(id, employeeId);
      const paymentMethod = await this.checkEmployeeAndPaymentMethod(
        employeeId,
        updateEmployeeBackAccountDto.paymentMethodId
      );

      if (
        paymentMethod.name === 'CASH' &&
        updateEmployeeBackAccountDto.accountNumber
      ) {
        throw new ResourceBadRequestException(
          'accountNumber',
          'accountNumber is not required'
        );
      }

      return this.employeePaymentMethodAccountRepo.save(
        Object.assign(
          employeePaymentMethodAccount,
          updateEmployeeBackAccountDto
        )
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        employeePaymentMethodAccountConstraint,
        updateEmployeeBackAccountDto
      );
    }
  }

  async delete(id: number, employeeId: number): Promise<void> {
    await this.findOne(id, employeeId);
    await this.employeePaymentMethodAccountRepo.delete(id);
  }
}
