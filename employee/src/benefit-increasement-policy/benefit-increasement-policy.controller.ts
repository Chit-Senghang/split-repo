import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  HttpCode,
  Put
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { BENEFIT_INCREASEMENT_POLICY_PERMISSION } from '../shared-resources/ts/enum/permission/employee/benefit-increasement-policy.enum';
import { PermissionGuard } from '../guards/permission.guard';
import { IdResponseDto } from '../shared-resources/swagger/response-class/id-response.swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { BenefitIncreasementPolicyService } from './benefit-increasement-policy.service';
import { CreateBenefitIncreasementPolicyDto } from './dto/create-benefit-increasement-policy.dto';
import { UpdateBenefitIncreasementPolicyDto } from './dto/update-benefit-increasement-policy.dto';
import { PaginationBenefitInscreasementPolicyDto } from './dto/pagination-benefit-increasement-policy.dto';
import { BenefitIncreasementPolicy } from './entities/benefit-increasement-policy.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('benefit-increasement-policy')
@Controller('benefit-increasement-policy')
export class BenefitIncreasementPolicyController {
  constructor(
    private readonly benefitIncreasementPolicyService: BenefitIncreasementPolicyService
  ) {}

  @UseGuards(
    PermissionGuard(
      BENEFIT_INCREASEMENT_POLICY_PERMISSION.CREATE_BENEFIT_INCREASEMENT_POLICY
    )
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(
    @Body()
    createBenefitIncreasementPolicyDto: CreateBenefitIncreasementPolicyDto
  ) {
    return this.benefitIncreasementPolicyService.create(
      createBenefitIncreasementPolicyDto
    );
  }

  @UseGuards(
    PermissionGuard(
      BENEFIT_INCREASEMENT_POLICY_PERMISSION.READ_BENEFIT_INCREASEMENT_POLICY
    )
  )
  @ApiOkResponse({ type: getPaginationResponseDto(BenefitIncreasementPolicy) })
  @Get()
  findAll(@Query() pagination: PaginationBenefitInscreasementPolicyDto) {
    return this.benefitIncreasementPolicyService.findAll(pagination);
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: PaginationBenefitInscreasementPolicyDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.benefitIncreasementPolicyService.exportFile(
      pagination,
      exportFileDto
    );
  }

  @ApiOkResponse({ type: BenefitIncreasementPolicy })
  @UseGuards(
    PermissionGuard(
      BENEFIT_INCREASEMENT_POLICY_PERMISSION.READ_BENEFIT_INCREASEMENT_POLICY
    )
  )
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.benefitIncreasementPolicyService.findOne(id);
  }

  @ApiOkResponse({ type: BenefitIncreasementPolicy })
  @UseGuards(
    PermissionGuard(
      BENEFIT_INCREASEMENT_POLICY_PERMISSION.UPDATE_BENEFIT_INCREASEMENT_POLICY
    )
  )
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body()
    updateBenefitIncreasementPolicyDto: UpdateBenefitIncreasementPolicyDto
  ) {
    return this.benefitIncreasementPolicyService.update(
      id,
      updateBenefitIncreasementPolicyDto
    );
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.benefitIncreasementPolicyService.delete(id);
  }
}
