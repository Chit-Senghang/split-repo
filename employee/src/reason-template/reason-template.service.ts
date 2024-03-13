import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOperator, In, Repository } from 'typeorm';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { ResourceNotFoundException } from '../shared-resources/exception/resource-not-found.exception';
import { DataTableNameEnum } from './../shared-resources/export-file/common/enum/data-table-name.enum';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { reasonTemplateConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import { CreateReasonTemplateDto } from './dto/create-reason-template.dto';
import { UpdateReasonTemplateDto } from './dto/update-reason-template.dto';
import { ReasonTemplate } from './entities/reason-template.entity';
import { PaginationReasonTemplateDto } from './dto/pagination-reason-template.dto';
import { ReasonTemplateTypeEnum } from './common/ts/enum/type.enum';

@Injectable()
export class ReasonTemplateService {
  private readonly REASON_TEMPLATE = 'reason template';

  constructor(
    @InjectRepository(ReasonTemplate)
    private readonly reasonTemplateRepo: Repository<ReasonTemplate>
  ) {}

  async create(
    createReasonTemplateDto: CreateReasonTemplateDto
  ): Promise<CreateReasonTemplateDto & ReasonTemplate> {
    try {
      const reasonTemplate = this.reasonTemplateRepo.create(
        createReasonTemplateDto
      );
      return this.reasonTemplateRepo.save(reasonTemplate);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        reasonTemplateConstraint,
        createReasonTemplateDto
      );
    }
  }

  async findAll(pagination: PaginationReasonTemplateDto) {
    let typeCondition:
      | ReasonTemplateTypeEnum
      | FindOperator<ReasonTemplateTypeEnum>;
    //list by module
    if (
      (pagination?.type && !pagination?.listAll) ||
      (!pagination?.type && !pagination?.listAll)
    ) {
      typeCondition = In([
        pagination?.type,
        ReasonTemplateTypeEnum.OTHER,
        ReasonTemplateTypeEnum.ALL
      ]);
    }
    //list by advance search
    else if (pagination?.type && pagination?.listAll) {
      typeCondition = pagination?.type;
    }
    return await GetPagination(this.reasonTemplateRepo, pagination, ['name'], {
      where: {
        type: typeCondition
      }
    });
  }

  async exportFile(
    pagination: PaginationReasonTemplateDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.REASON_TEMPLATE,
      exportFileDto,
      data
    );
  }

  async findOne(id: number) {
    const reasonTemplate = await this.reasonTemplateRepo.findOneBy({ id });
    if (!reasonTemplate) {
      throw new ResourceNotFoundException(this.REASON_TEMPLATE, id);
    }
    return reasonTemplate;
  }

  async update(
    id: number,
    updateReasonTemplateDto: UpdateReasonTemplateDto
  ): Promise<ReasonTemplate & UpdateReasonTemplateDto> {
    try {
      const reasonTemplate = await this.findOne(id);

      //CHECK: is system defined = true; not allow to update type
      if (
        reasonTemplate.isSystemDefined &&
        updateReasonTemplateDto.type &&
        updateReasonTemplateDto.type !== reasonTemplate.type
      ) {
        throw new ResourceBadRequestException(
          'type',
          'You cannot change type of record because of system defined.'
        );
      }

      return this.reasonTemplateRepo.save(
        Object.assign(reasonTemplate, updateReasonTemplateDto)
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        reasonTemplateConstraint,
        updateReasonTemplateDto
      );
    }
  }

  async delete(id: number): Promise<void> {
    const reasonTemplate = await this.findOne(id);
    if (reasonTemplate.isSystemDefined) {
      throw new ResourceBadRequestException(
        'reason template',
        'You cannot delete because of system defined.'
      );
    }
    await this.reasonTemplateRepo.delete(id);
  }

  async getTemplates() {
    const templates = await this.reasonTemplateRepo.find();
    return { data: templates };
  }
}
