import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMappingInterceptor } from '../shared-resources/common/interceptor/response-mapping.interceptor';
import { SeniorityService } from './seniority.service';
import { PaginationSeniorityDto } from './dto/paginate.dto';

@UseInterceptors(ResponseMappingInterceptor)
@ApiTags('seniority')
@Controller('seniority')
export class SeniorityController {
  constructor(private readonly seniorityService: SeniorityService) {}

  @Get()
  findAll(@Query() paginate: PaginationSeniorityDto) {
    return this.seniorityService.findAll(paginate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seniorityService.findOne(+id);
  }
}
