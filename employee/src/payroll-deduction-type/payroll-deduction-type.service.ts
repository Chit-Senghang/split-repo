import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { payrollConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreatePayrollDeductionTypeDto } from './dto/create-payroll-deduction-type.dto';
import { UpdatePayrollDeductionTypeDto } from './dto/update-payroll-deduction-type.dto';
import { PayrollDeductionType } from './entities/payroll-deduction-type.entity';
import { PayrollDeductionTypePagination } from './dto/payroll-deduction-type-pagination.dto';
import { PayrollDeductionTypeValidationService } from './payroll-deduction-type.validation.service';

@Injectable()
export class PayrollDeductionTypeService {
  constructor(
    @InjectRepository(PayrollDeductionType)
    private readonly payrollDeductionTypeRepo: Repository<PayrollDeductionType>,
    private readonly payrollDeductionTypeValidationService: PayrollDeductionTypeValidationService
  ) {}

  async create(
    createPayrollDeductionTypeDto: CreatePayrollDeductionTypeDto
  ): Promise<PayrollDeductionType> {
    try {
      const payrollDeductionType: PayrollDeductionType =
        this.payrollDeductionTypeRepo.create(createPayrollDeductionTypeDto);

      return this.payrollDeductionTypeRepo.save(payrollDeductionType);
    } catch (exception) {
      handleResourceConflictException(exception, payrollConstraint);
    }
  }

  async findAll(
    pagination: PayrollDeductionTypePagination
  ): Promise<PaginationResponse<PayrollDeductionType>> {
    return GetPagination(this.payrollDeductionTypeRepo, pagination, ['name'], {
      where: { isSystemDefined: pagination.isSystemDefined }
    });
  }

  async exportFile(
    pagination: PayrollDeductionTypePagination,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.PAYROLL_DEDUCTION_TYPE,
      exportFileDto,
      data
    );
  }

  async findOne(id: number): Promise<PayrollDeductionType> {
    return await this.payrollDeductionTypeValidationService.checkPayrollDeductionType(
      id
    );
  }

  async update(
    id: number,
    updatePayrollDeductionTypeDto: UpdatePayrollDeductionTypeDto
  ): Promise<PayrollDeductionType> {
    try {
      const payrollDeductionType: PayrollDeductionType =
        await this.payrollDeductionTypeValidationService.checkPayrollDeductionType(
          id
        );
      await this.payrollDeductionTypeValidationService.validateSystemDefined(
        payrollDeductionType
      );

      const updatePayrollDeductionType = this.payrollDeductionTypeRepo.create(
        Object.assign(payrollDeductionType, updatePayrollDeductionTypeDto)
      );

      return this.payrollDeductionTypeRepo.save(updatePayrollDeductionType);
    } catch (exception) {
      handleResourceConflictException(exception, payrollConstraint);
    }
  }

  async delete(id: number): Promise<void> {
    const payrollDeductionType =
      await this.payrollDeductionTypeValidationService.checkPayrollDeductionType(
        id
      );
    await this.payrollDeductionTypeValidationService.validateSystemDefined(
      payrollDeductionType
    );

    await this.payrollDeductionTypeRepo.delete(id);
  }
}
