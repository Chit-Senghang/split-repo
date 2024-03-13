import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ResourceBadRequestException } from './../shared-resources/exception/badRequest.exception';
import { ExportFileDto } from './../shared-resources/export-file/dto/export-file.dto';
import { handleResourceConflictException } from './../shared-resources/common/utils/handle-resource-conflict-exception';
import { codeValueConstraint } from './../shared-resources/ts/constants/resource-exception-constraints';
import {
  CodeEnum,
  CODE_DOCUMENT_TYPE_PERMISSION,
  CODE_EDUCATION_TYPE_PERMISSION,
  CODE_RELATIONSHIP_PERMISSION,
  CODE_RESIGNATION_TYPE,
  CODE_SKILL_PERMISSION,
  CODE_TRAINING_PERMISSION,
  CODE_WARNING_TYPE_PERMISSION,
  CODE_COMPANY_STRUCTURE_COMPONENT
} from './ts/enums/code.enum';
import { Code, CodeValue } from './entity';
import { CreateCodeValueDto } from './dto/create-code-value.dto';
import { UpdateCodeValueDto } from './dto/update-code-value.dto';
import { CodeTypesEnum } from './ts/enums/permission.enum';
import { PaginationCodeValueDto } from './dto/pagination-code-value.dto';

@Injectable()
export class CodeValueService {
  private readonly CODE = 'code';

  private readonly CODE_VALUE = 'code value';

  constructor(
    @InjectRepository(Code) private readonly codeRepo: Repository<Code>,
    @InjectRepository(CodeValue)
    private readonly codeValueRepo: Repository<CodeValue>
  ) {}

  async getAllValueByCode(code: string) {
    const data = await this.codeRepo.find({
      relations: { codeValue: true },
      where: {
        code,
        ...(code === CodeEnum.CURRENCY && {
          codeValue: { isSystemDefined: true }
        })
      }
    });
    return { data: instanceToPlain(data) };
  }

  async checkValidCode(code: string) {
    const codeData = await this.codeRepo.findOne({
      where: { code: code }
    });
    if (!codeData) {
      throw new ResourceNotFoundException(`Code value of type ${code} of `);
    }
    return codeData;
  }

  async checkValidCodeType(code: CodeTypesEnum, method: string) {
    if (!Object.values(CodeTypesEnum).includes(code)) {
      throw new ResourceForbiddenException(
        'Code must be one of the following values: RELATIONSHIP,DOCUMENT_TYPE,EDUCATION_TYPE,TRAINING,SKILL,RESIGNATION_TYPE,WARNING_TYPE'
      );
    }
    method = method.toUpperCase();
    let permissionType = '';
    switch (method) {
      case 'GET': {
        permissionType = permissionType.concat('READ_', code).toString();
        break;
      }
      case 'POST': {
        permissionType = permissionType.concat('CREATE_', code).toString();
        break;
      }
      case 'PATCH': {
        permissionType = permissionType.concat('UPDATE_', code).toString();
        break;
      }
      case 'DELETE': {
        permissionType = permissionType.concat('DELETE_', code).toString();
        break;
      }
    }
    switch (code) {
      case CodeTypesEnum.DOCUMENT_TYPE: {
        if (
          !Object.values(CODE_DOCUMENT_TYPE_PERMISSION)
            .toString()
            .includes(permissionType)
        ) {
          throw new ResourceForbiddenException('Unauthorized');
        }
        return;
      }
      case CodeTypesEnum.RELATIONSHIP: {
        if (
          !Object.values(CODE_RELATIONSHIP_PERMISSION)
            .toString()
            .includes(permissionType)
        ) {
          throw new ResourceForbiddenException('Unauthorized');
        }
        return;
      }
      case CodeTypesEnum.EDUCATION_TYPE: {
        if (
          !Object.values(CODE_EDUCATION_TYPE_PERMISSION)
            .toString()
            .includes(permissionType)
        ) {
          throw new ResourceForbiddenException('Unauthorized');
        }
        return;
      }
      case CodeTypesEnum.RESIGNATION_TYPE: {
        if (
          !Object.values(CODE_RESIGNATION_TYPE)
            .toString()
            .includes(permissionType)
        ) {
          throw new ResourceForbiddenException('Unauthorized');
        }
        return;
      }
      case CodeTypesEnum.SKILL: {
        if (
          !Object.values(CODE_SKILL_PERMISSION)
            .toString()
            .includes(permissionType)
        ) {
          throw new ResourceForbiddenException('Unauthorized');
        }
        return;
      }
      case CodeTypesEnum.TRAINING: {
        if (
          !Object.values(CODE_TRAINING_PERMISSION)
            .toString()
            .includes(permissionType)
        ) {
          throw new ResourceForbiddenException('Unauthorized');
        }
        return;
      }
      case CodeTypesEnum.WARNING_TYPE: {
        if (
          !Object.values(CODE_WARNING_TYPE_PERMISSION)
            .toString()
            .includes(permissionType)
        ) {
          throw new ResourceForbiddenException('Unauthorized');
        }
        return;
      }
      case CodeTypesEnum.COMPANY_STRUCTURE_COMPONENT_COLOR: {
        if (
          !Object.values(CODE_COMPANY_STRUCTURE_COMPONENT)
            .toString()
            .includes(permissionType)
        ) {
          throw new ResourceForbiddenException('Unauthorized');
        }
        return;
      }
    }
  }

  async createCodeValue(
    pagination: PaginationCodeValueDto,
    createCodeValueDto: CreateCodeValueDto
  ): Promise<CodeValue> {
    try {
      await this.checkValidCodeType(pagination.code, 'POST');
      const codeId = await this.checkValidCode(String(pagination.code));

      if (codeId.code === CodeTypesEnum.COMPANY_STRUCTURE_COMPONENT_COLOR) {
        throw new ResourceConflictException(
          this.CODE_VALUE,
          'You cannot create company structure components color'
        );
      }

      const codeValue = this.codeValueRepo.create({
        value: createCodeValueDto.value,
        codeId: { id: codeId.id },
        identifier: createCodeValueDto.identifier || null
      });
      return await this.codeValueRepo.save(codeValue);
    } catch (exception) {
      handleResourceConflictException(
        exception,
        codeValueConstraint,
        createCodeValueDto
      );
    }
  }

  async findOne(
    id: number,
    pagination: PaginationCodeValueDto
  ): Promise<CodeValue> {
    await this.checkValidCodeType(pagination.code, 'GET');
    const codeData = await this.codeRepo.findOne({
      where: { code: pagination.code }
    });
    const codeValue = await this.codeValueRepo.findOne({
      where: { id: id, codeId: { id: codeData.id } },
      relations: { codeId: true, parentId: true }
    });
    if (!codeValue) {
      throw new ResourceNotFoundException(
        `${this.CODE_VALUE} of ${id} doesn't match with ${pagination.code}`
      );
    }
    return codeValue;
  }

  async findAll(
    pagination: PaginationCodeValueDto
  ): Promise<PaginationResponse<CodeValue>> {
    let isEnabled = true;
    if (pagination.isEnabled) {
      isEnabled = pagination.isEnabled;
    }
    await this.checkValidCodeType(pagination.code, 'GET');
    return GetPagination(this.codeValueRepo, pagination, ['value'], {
      where: {
        isEnabled: isEnabled,
        isSystemDefined: pagination.isSystemDefined
          ? pagination.isSystemDefined
          : null,
        code: {
          code: pagination.code
        }
      }
    });
  }

  async exportFile(
    pagination: PaginationCodeValueDto,
    exportFileDto: ExportFileDto
  ) {
    const dataTableName = pagination.code;
    const { data } = await this.findAll(pagination);
    switch (dataTableName) {
      case CodeTypesEnum.NATIONALITY:
      case CodeTypesEnum.RELATIONSHIP:
      case CodeTypesEnum.DOCUMENT_TYPE:
      case CodeTypesEnum.EDUCATION_TYPE:
      case CodeTypesEnum.TRAINING:
      case CodeTypesEnum.SKILL:
      case CodeTypesEnum.RESIGNATION_TYPE:
      case CodeTypesEnum.WARNING_TYPE:
      case CodeTypesEnum.MOVEMENT:
      case CodeTypesEnum.LANGUAGE:
      case CodeTypesEnum.CURRENCY:
      case CodeTypesEnum.COUNTRY:
      case CodeTypesEnum.COMPANY_STRUCTURE_COMPONENT_COLOR:
      case CodeTypesEnum.GENDER:
      case CodeTypesEnum.MARITAL_STATUS:
        return await exportDataFiles(
          pagination.exportFileType,
          dataTableName,
          exportFileDto,
          data
        );
      default:
        throw new ResourceBadRequestException(
          dataTableName,
          `unsupported data table name ${dataTableName}`
        );
    }
  }

  async updateCodeValue(
    id: number,
    pagination: PaginationCodeValueDto,
    updateCodeValue: UpdateCodeValueDto
  ) {
    try {
      const codeValue = await this.findOne(id, pagination);
      await this.checkValidCodeType(pagination.code, 'PATCH');
      await this.checkValidCode(pagination.code);
      if (codeValue.isSystemDefined === true) {
        throw new ResourceForbiddenException(
          'You are not allowed to make any changes due to system defined'
        );
      }
      return await this.codeValueRepo.save(
        Object.assign(codeValue, {
          ...updateCodeValue
        })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        codeValueConstraint,
        updateCodeValue
      );
    }
  }

  async delete(id: number, pagination: PaginationCodeValueDto): Promise<void> {
    await this.checkValidCodeType(pagination.code, 'DELETE');
    const codeValue = await this.findOne(id, pagination);
    if (
      codeValue.codeId.code === CodeTypesEnum.COMPANY_STRUCTURE_COMPONENT_COLOR
    ) {
      throw new ResourceConflictException(
        this.CODE_VALUE,
        'You cannot delete company structure components color'
      );
    }
    if (codeValue.isSystemDefined === true) {
      throw new ResourceForbiddenException(
        'You are not allowed to make any changes due to system defined'
      );
    }
    await this.codeValueRepo.delete(id);
  }
}
