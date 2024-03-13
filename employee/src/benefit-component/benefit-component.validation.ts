import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { BenefitComponentType } from '../benefit-component-type/entities/benefit-component-type.entity';
import { BenefitComponent } from './entities/benefit-component.entity';
import { BENEFIT_COMPONENT_RELATIONSHIP } from './constant/benefit-component-relationship.constant';
import { BENEFIT_COMPONENT_SELECTED_FIELDS } from './constant/benefit-component-selected-fields.constant';

@Injectable()
export class BenefitComponentValidationService {
  private readonly BENEFIT_COMPONENT = 'benefit component';

  private readonly BENEFIT_COMPONENT_TYPE = 'benefit component type';

  private readonly BASE_SALARY = 'BASE SALARY';

  constructor(
    @InjectRepository(BenefitComponent)
    private readonly salaryComponentRepo: Repository<BenefitComponent>,
    @InjectRepository(BenefitComponentType)
    private readonly salaryComponentTypeRepo: Repository<BenefitComponentType>
  ) {}

  async checkBenefitComponentById(id: number): Promise<BenefitComponent> {
    const salaryComponent: BenefitComponent =
      await this.salaryComponentRepo.findOne({
        where: {
          id
        },
        relations: BENEFIT_COMPONENT_RELATIONSHIP,
        select: BENEFIT_COMPONENT_SELECTED_FIELDS
      });

    if (!salaryComponent) {
      throw new ResourceNotFoundException(this.BENEFIT_COMPONENT, id);
    }

    return salaryComponent;
  }

  async checkBenefitComponentTypeById(id: number): Promise<void> {
    const salaryComponentType: BenefitComponentType =
      await this.salaryComponentTypeRepo.findOneBy({ id });

    if (!salaryComponentType) {
      throw new ResourceNotFoundException(this.BENEFIT_COMPONENT_TYPE, id);
    }

    if (salaryComponentType.name === this.BASE_SALARY) {
      throw new ResourceBadRequestException(
        'benefitComponentId',
        `You are not allow to create data under type ${this.BASE_SALARY}.`
      );
    }
  }
}
