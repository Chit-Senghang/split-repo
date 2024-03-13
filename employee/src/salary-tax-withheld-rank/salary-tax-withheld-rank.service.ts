import { Inject, Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { CreateSalaryTaxWithheldRankDto } from './dto/create-salary-tax-withheld-rank.dto';
import { UpdateSalaryTaxWithheldRankDto } from './dto/update-salary-tax-withheld-rank.dto';
import { SalaryTaxWithheldRankRepository } from './repository/salary-tax-withheld-rank.repository';
import { ISalaryTaxWithheldRank } from './repository/interfaces/salary-tax-withheld-rank.interface.interface';
import { SalaryTaxWithheldRank } from './entities/salary-tax-withheld-rank.entity';
import { SalaryTaxWithheldRankQueryDto } from './dto/salary-tax-withheld-rank-query.dto';

type ValidateAmountParams = {
  createFromAmount: number;
  createToAmount: number;
  fromAmount: number;
  toAmount: number;
};

@Injectable()
export class SalaryTaxWithheldRankService {
  constructor(
    @Inject(SalaryTaxWithheldRankRepository)
    private readonly salaryTaxWithheldRankRepo: ISalaryTaxWithheldRank
  ) {}

  async create(
    createSalaryTaxWithheldRankDto: CreateSalaryTaxWithheldRankDto
  ): Promise<SalaryTaxWithheldRank> {
    //validate amount with existing records.
    await this.validateAmount(
      createSalaryTaxWithheldRankDto.fromAmount,
      createSalaryTaxWithheldRankDto.toAmount
    );

    const salaryTaxWithheldRankEntity: SalaryTaxWithheldRank =
      this.salaryTaxWithheldRankRepo.create({
        ...createSalaryTaxWithheldRankDto
      });

    return await this.salaryTaxWithheldRankRepo.save(
      salaryTaxWithheldRankEntity
    );
  }

  async exportFile(
    pagination: SalaryTaxWithheldRankQueryDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.SALARY_TAX_WITHHELD_RANK,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: SalaryTaxWithheldRankQueryDto
  ): Promise<PaginationResponse<SalaryTaxWithheldRank>> {
    return await this.salaryTaxWithheldRankRepo.findAllWithPagination(
      pagination,
      [],
      {
        orderBy: {
          fromAmount: 'ASC'
        }
      }
    );
  }

  async findOne(id: number): Promise<SalaryTaxWithheldRank> {
    return await this.salaryTaxWithheldRankRepo.getOneOrFailed(id);
  }

  async update(
    id: number,
    updateSalaryTaxWithheldRankDto: UpdateSalaryTaxWithheldRankDto
  ): Promise<SalaryTaxWithheldRank> {
    const salaryTaxWithheldRank: SalaryTaxWithheldRank =
      await this.salaryTaxWithheldRankRepo.getOneOrFailed(id);

    // assign default value.
    if (!updateSalaryTaxWithheldRankDto.fromAmount) {
      updateSalaryTaxWithheldRankDto.fromAmount =
        salaryTaxWithheldRank.fromAmount;
    }
    if (!updateSalaryTaxWithheldRankDto.toAmount) {
      updateSalaryTaxWithheldRankDto.toAmount = salaryTaxWithheldRank.toAmount;
    }

    //validate amount with existing records.
    await this.validateAmount(
      updateSalaryTaxWithheldRankDto.fromAmount,
      updateSalaryTaxWithheldRankDto.toAmount,
      id
    );

    const salaryTaxWithheldRankEntity: SalaryTaxWithheldRank =
      this.salaryTaxWithheldRankRepo.create({
        ...salaryTaxWithheldRank,
        ...updateSalaryTaxWithheldRankDto
      });

    return await this.salaryTaxWithheldRankRepo.save(
      salaryTaxWithheldRankEntity
    );
  }

  async delete(id: number) {
    await this.salaryTaxWithheldRankRepo.softDelete(id);
  }

  // ================== [Private block] ==================
  private async validateAmount(
    fromAmount: number,
    toAmount: number,
    id?: number
  ) {
    //check fromAmount with toAmount
    if (toAmount && toAmount <= fromAmount) {
      throw new ResourceBadRequestException(
        'toAmount',
        'To amount must be greater than from amount.'
      );
    }

    const salaryTaxWithheldRanks: SalaryTaxWithheldRank[] =
      await this.salaryTaxWithheldRankRepo.find({
        where: id && { id: Not(id) }
      });

    //validate amount with existing records.
    salaryTaxWithheldRanks.forEach(
      (salaryTaxWithheldRank: SalaryTaxWithheldRank) => {
        this.validateAmountBetweenRange({
          createFromAmount: Number(fromAmount),
          createToAmount: toAmount,
          fromAmount: Number(salaryTaxWithheldRank.fromAmount),
          toAmount: salaryTaxWithheldRank.toAmount
        });
      }
    );
  }

  private validateAmountBetweenRange({
    createFromAmount,
    createToAmount,
    fromAmount,
    toAmount
  }: ValidateAmountParams): void {
    if (
      (createFromAmount >= fromAmount &&
        createFromAmount <= Number(toAmount)) ||
      (!toAmount && createFromAmount >= fromAmount) ||
      (!createToAmount && !toAmount)
    ) {
      throw new ResourceConflictException(
        'fromAmount',
        'From amount already exists in other range.'
      );
    }
  }
}
