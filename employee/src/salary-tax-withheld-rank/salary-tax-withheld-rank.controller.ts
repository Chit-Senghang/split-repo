import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  HttpCode
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { SalaryTaxWithheldRankPermission } from '../shared-resources/ts/enum/permission/employee/salay-tax-withheld-rank.enum';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { PermissionGuard } from '../guards/permission.guard';
import { SalaryTaxWithheldRankService } from './salary-tax-withheld-rank.service';
import { CreateSalaryTaxWithheldRankDto } from './dto/create-salary-tax-withheld-rank.dto';
import { UpdateSalaryTaxWithheldRankDto } from './dto/update-salary-tax-withheld-rank.dto';
import { SalaryTaxWithheldRankQueryDto } from './dto/salary-tax-withheld-rank-query.dto';
import { SalaryTaxWithheldRank } from './entities/salary-tax-withheld-rank.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiTags('salary-tax-withheld-rank')
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@Controller('salary-tax-withheld-rank')
export class SalaryTaxWithheldRankController {
  constructor(
    private readonly salaryTaxWithheldRankService: SalaryTaxWithheldRankService
  ) {}

  @ApiOkResponse({ type: SalaryTaxWithheldRank })
  @UseGuards(
    PermissionGuard(
      SalaryTaxWithheldRankPermission.CREATE_SALARY_TAX_WITHHELD_RANK
    )
  )
  @Post()
  create(
    @Body() createSalaryTaxWithheldRankDto: CreateSalaryTaxWithheldRankDto
  ) {
    return this.salaryTaxWithheldRankService.create(
      createSalaryTaxWithheldRankDto
    );
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: SalaryTaxWithheldRankQueryDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.salaryTaxWithheldRankService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @ApiOkResponse({ type: getPaginationResponseDto(SalaryTaxWithheldRank) })
  @UseGuards(
    PermissionGuard(
      SalaryTaxWithheldRankPermission.READ_SALARY_TAX_WITHHELD_RANK
    )
  )
  @Get()
  findAll(@Query() pagination: SalaryTaxWithheldRankQueryDto) {
    return this.salaryTaxWithheldRankService.findAll(pagination);
  }

  @ApiOkResponse({ type: SalaryTaxWithheldRank })
  @UseGuards(
    PermissionGuard(
      SalaryTaxWithheldRankPermission.READ_SALARY_TAX_WITHHELD_RANK
    )
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaryTaxWithheldRankService.findOne(id);
  }

  @ApiOkResponse({ type: SalaryTaxWithheldRank })
  @UseGuards(
    PermissionGuard(
      SalaryTaxWithheldRankPermission.UPDATE_SALARY_TAX_WITHHELD_RANK
    )
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaryTaxWithheldRankDto: UpdateSalaryTaxWithheldRankDto
  ) {
    return this.salaryTaxWithheldRankService.update(
      id,
      updateSalaryTaxWithheldRankDto
    );
  }

  @UseGuards(
    PermissionGuard(
      SalaryTaxWithheldRankPermission.DELETE_SALARY_TAX_WITHHELD_RANK
    )
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.salaryTaxWithheldRankService.delete(id);
  }
}
