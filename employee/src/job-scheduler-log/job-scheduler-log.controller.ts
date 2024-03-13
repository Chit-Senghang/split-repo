import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { QueryJobSchedulerLogDto } from './dto/query-job-scheduler-log.dto';
import { CronService } from './cron.service';
import { QueryJobSchedulerLogExportDto } from './dto/query-job-scheduler-log-export.dto';

@ApiBearerAuth()
@ApiTags('employee-job-scheduler')
@Controller('employee/job-scheduler')
export class JobSchedulerLogController {
  constructor(private readonly cronService: CronService) {}

  @Post()
  jobSchedulerLog(@Query() jobSchedulerLogQueryDto: QueryJobSchedulerLogDto) {
    const { jobSchedulerLogName } = jobSchedulerLogQueryDto;
    this.cronService.jobSchedulerLogManual(jobSchedulerLogName);
  }

  @Get()
  findAll() {
    return this.cronService.findAll();
  }

  @Post('export')
  exportFile(
    @Query()
    pagination: QueryJobSchedulerLogExportDto,
    @Body() exportFileDto: ExportFileDto
  ) {
    return this.cronService.exportFile(pagination, exportFileDto);
  }
}
