import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { ExportFileDto } from '../../shared-resources/export-file/dto/export-file.dto';
import { exportDataFiles } from '../../shared-resources/export-file/common/function/export-data-files';
import { DataTableNameEnum } from '../../shared-resources/export-file/common/enum/data-table-name.enum';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { PaginationResponse } from '../../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../../shared-resources/utils/pagination-query.common';
import { PaginationQueryCompanyStructureComponentDto } from '../dto/components/pagination-company-structure-component.dto';
import { CreateCompanyStructureComponentDto } from '../dto/components/create-company-structure-component.dto';
import { EmployeeProto } from '../../shared-resources/proto';
import { CompanyStructureTypeEnum } from '../common/ts/enum/structure-type.enum';
import { ResourceForbiddenException } from '../../shared-resources/exception/forbidden.exception';
import { BenefitIncreasementPolicyService } from '../../benefit-increasement-policy/benefit-increasement-policy.service';
import { companyStructureComponentConstraint } from './../../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from './../../shared-resources/common/utils/handle-resource-conflict-exception';
import { CompanyStructureComponent } from './entities/company-structure-component.entity';

@Injectable()
export class CompanyStructureComponentService {
  private readonly COMPANY_STRUCTURE_COMPONENT = 'company structure component';

  constructor(
    @InjectRepository(CompanyStructureComponent)
    private readonly companyStructureComponentRepo: Repository<CompanyStructureComponent>,
    private readonly benefitIncreasementPolicyService: BenefitIncreasementPolicyService
  ) {}

  async create(
    companyStructureComponent: CreateCompanyStructureComponentDto,
    id?: number
  ): Promise<CompanyStructureComponent> {
    try {
      if (companyStructureComponent.postProbationBenefitIncrementPolicyId) {
        await this.benefitIncreasementPolicyService.checkBenefitIncreasementPolicyById(
          companyStructureComponent.postProbationBenefitIncrementPolicyId
        );
      }
      if (
        companyStructureComponent.type !== CompanyStructureTypeEnum.POSITION &&
        companyStructureComponent.postProbationBenefitIncrementPolicyId
      ) {
        throw new ResourceForbiddenException(
          'postProbationBenefitIncreasementId should not be created with other type, besides type of position'
        );
      }

      if (id) {
        await this.findOne(id);
      }

      const checkName = companyStructureComponent.name.trim();
      return await this.companyStructureComponentRepo.save(
        this.companyStructureComponentRepo.create({
          id: id ?? null,
          name: checkName,
          type: companyStructureComponent.type,
          nameKh: companyStructureComponent.nameKh,
          postProbationBenefitIncreasementPolicy: {
            id: companyStructureComponent.postProbationBenefitIncrementPolicyId
          }
        })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        companyStructureComponentConstraint,
        companyStructureComponent
      );
    }
  }

  async update(
    id: number,
    updateCompanyStructureComponentDto: CreateCompanyStructureComponentDto
  ) {
    try {
      if (
        updateCompanyStructureComponentDto.postProbationBenefitIncrementPolicyId
      ) {
        await this.benefitIncreasementPolicyService.checkBenefitIncreasementPolicyById(
          updateCompanyStructureComponentDto.postProbationBenefitIncrementPolicyId
        );
      }
      if (
        updateCompanyStructureComponentDto.type !==
          CompanyStructureTypeEnum.POSITION &&
        updateCompanyStructureComponentDto.postProbationBenefitIncrementPolicyId
      ) {
        throw new ResourceForbiddenException(
          'postProbationBenefitIncreasementId should not be created with other type, besides type of position'
        );
      }
      const trimStructurePosition =
        updateCompanyStructureComponentDto.name.trim();
      const structurePosition = await this.findOne(id);
      return await this.companyStructureComponentRepo.save(
        Object.assign(structurePosition, {
          name: trimStructurePosition,
          nameKh: updateCompanyStructureComponentDto.nameKh,
          type: updateCompanyStructureComponentDto.type,
          postProbationBenefitIncreasementPolicy: {
            id: updateCompanyStructureComponentDto.postProbationBenefitIncrementPolicyId
          }
        })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        companyStructureComponentConstraint,
        updateCompanyStructureComponentDto
      );
    }
  }

  async exportFile(
    pagination: PaginationQueryCompanyStructureComponentDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.COMPANY_STRUCTURE_COMPONENT,
      exportFileDto,
      data
    );
  }

  async findAll(
    pagination: PaginationQueryCompanyStructureComponentDto
  ): Promise<PaginationResponse<CompanyStructureComponent>> {
    return GetPagination(
      this.companyStructureComponentRepo,
      pagination,
      ['name'],
      {
        where: {
          type: pagination.type
        } as FindOptionsWhere<CompanyStructureComponent>,
        relation: {
          companyStructure: true,
          postProbationBenefitIncreasementPolicy: true
        },
        select: {
          postProbationBenefitIncreasementPolicy: { id: true, name: true }
        }
      }
    );
  }

  async findOne(id: number): Promise<CompanyStructureComponent> {
    const structurePosition = await this.companyStructureComponentRepo.findOne({
      where: { id },
      relations: {
        companyStructure: true,
        postProbationBenefitIncreasementPolicy: true
      },
      select: {
        postProbationBenefitIncreasementPolicy: { id: true, name: true }
      }
    });
    if (!structurePosition) {
      throw new ResourceNotFoundException(this.COMPANY_STRUCTURE_COMPONENT, id);
    }
    return structurePosition;
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.companyStructureComponentRepo.delete(id);
  }

  async grpcFindOne(
    param: EmployeeProto.CompanyStructureOutletId
  ): Promise<EmployeeProto.CompanyStructureComponentDto> {
    const companyStructureComponent =
      await this.companyStructureComponentRepo.findOneBy({
        id: param.id,
        type: CompanyStructureTypeEnum.DEPARTMENT
      });
    if (!companyStructureComponent) {
      throw new RpcException({
        code: 5,
        message: `Resource company structure component of department of ${param.id} not found`
      });
    }
    return companyStructureComponent;
  }
}
