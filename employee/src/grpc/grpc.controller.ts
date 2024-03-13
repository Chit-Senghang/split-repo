import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationProto } from '../shared-resources/proto';
import { GrpcService } from './grpc.service';

@ApiBearerAuth()
@ApiTags('grpc')
@Controller('grpc')
export class GrpcController {
  constructor(private readonly grpcService: GrpcService) {}

  @Get()
  getTemplates() {
    return this.grpcService.getTemplates();
  }

  @Get(':id')
  getOneReasonTemplate(@Param('id') id: number) {
    return this.grpcService.getOneReasonTemplate(id);
  }

  @Post()
  createAuditLogging(
    createAuditLoggingDto: AuthenticationProto.createAuditLoggingDto
  ) {
    return this.createAuditLogging(createAuditLoggingDto);
  }
}
