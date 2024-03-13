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
  UseInterceptors,
  ParseIntPipe,
  HttpCode
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { BenefitAdjustmentTypePermissionEnum } from '../shared-resources/ts/enum/permission/employee/benefit-adjustment-type.enum';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { PermissionGuard } from '../guards/permission.guard';
import { BenefitAdjustmentTypeService } from './benefit-adjustment-type.service';
import { CreateBenefitAdjustmentTypeDto } from './dto/create-benefit-adjustment-type.dto';
import { UpdateBenefitAdjustmentTypeDto } from './dto/update-benefit-adjustment-type.dto';
import { BenefitAdjustmentTypeQueryDto } from './dto/benefit-adjustment-type-query.dto';
import { BenefitAdjustmentType } from './entities/benefit-adjustment-type.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('benefit-adjustment-type')
@Controller('benefit-adjustment-type')
export class BenefitAdjustmentTypeController {
  constructor(
    private readonly benefitAdjustmentTypeService: BenefitAdjustmentTypeService
  ) {}

  @Post('export')
  exportFile(
    @Query()
    pagination: BenefitAdjustmentTypeQueryDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.benefitAdjustmentTypeService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @ApiCreatedResponse({ type: IdResponseDto })
  @UseGuards(
    PermissionGuard(
      BenefitAdjustmentTypePermissionEnum.CREATE_BENEFIT_ADJUSTMENT_TYPE
    )
  )
  @Post()
  create(
    @Body() createBenefitAdjustmentTypeDto: CreateBenefitAdjustmentTypeDto
  ) {
    return this.benefitAdjustmentTypeService.create(
      createBenefitAdjustmentTypeDto
    );
  }

  @ApiOkResponse({ type: getPaginationResponseDto(BenefitAdjustmentType) })
  @UseGuards(
    PermissionGuard(
      BenefitAdjustmentTypePermissionEnum.READ_BENEFIT_ADJUSTMENT_TYPE
    )
  )
  @Get()
  findAll(@Query() query: BenefitAdjustmentTypeQueryDto) {
    return this.benefitAdjustmentTypeService.findAll(query);
  }

  @ApiOkResponse({ type: BenefitAdjustmentType })
  @UseGuards(
    PermissionGuard(
      BenefitAdjustmentTypePermissionEnum.READ_BENEFIT_ADJUSTMENT_TYPE
    )
  )
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.benefitAdjustmentTypeService.findOne(id);
  }

  @ApiOkResponse({ type: BenefitAdjustmentType })
  @UseGuards(
    PermissionGuard(
      BenefitAdjustmentTypePermissionEnum.UPDATE_BENEFIT_ADJUSTMENT_TYPE
    )
  )
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBenefitAdjustmentTypeDto: UpdateBenefitAdjustmentTypeDto
  ) {
    return this.benefitAdjustmentTypeService.update(
      id,
      updateBenefitAdjustmentTypeDto
    );
  }

  @UseGuards(
    PermissionGuard(
      BenefitAdjustmentTypePermissionEnum.DELETE_BENEFIT_ADJUSTMENT_TYPE
    )
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.benefitAdjustmentTypeService.delete(id);
  }
}
