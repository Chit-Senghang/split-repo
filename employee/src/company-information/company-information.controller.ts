import { Controller, Get, Body, Put, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { getErrorResponseDto } from '../shared-resources/swagger/response-class/error-response.swagger';
import { getPaginationResponseDto } from '../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { CompanyInformationService } from './company-information.service';
import { CreateCompanyInformationDto } from './dto/create-company-information.dto';
import { CompanyInformation } from './entities/company-information.entity';

@UseInterceptors(ResponseMappingInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@ApiTags('company-information')
@Controller('company-information')
export class CompanyInformationController {
  constructor(
    private readonly companyInformationService: CompanyInformationService
  ) {}

  @ApiOkResponse({ type: getPaginationResponseDto(CompanyInformation) })
  @Put()
  create(@Body() createCompanyInformationDto: CreateCompanyInformationDto) {
    return this.companyInformationService.update(createCompanyInformationDto);
  }

  @Get()
  findOne() {
    return this.companyInformationService.findOne();
  }
}
