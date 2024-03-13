import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEntityTypeEnum } from '../media/common/ts/enums/entity-type.enum';
import { Media } from '../media/entities/media.entity';
import { CreateCompanyInformationDto } from './dto/create-company-information.dto';
import { CompanyInformation } from './entities/company-information.entity';

@Injectable()
export class CompanyInformationService {
  constructor(
    @InjectRepository(CompanyInformation)
    private readonly companyInformationRepo: Repository<CompanyInformation>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>
  ) {}

  async update(
    createCompanyInformationDto: CreateCompanyInformationDto
  ): Promise<CompanyInformation> {
    const companyInformation = await this.companyInformationRepo.find({
      take: 1
    });
    return await this.companyInformationRepo.save(
      Object.assign(companyInformation.at(0), {
        ...createCompanyInformationDto
      })
    );
  }

  async findOne(): Promise<CompanyInformation> {
    const companyInformation: any = await this.companyInformationRepo.find({
      take: 1
    });
    const media = await this.mediaRepo.findOne({
      where: {
        entityType: MediaEntityTypeEnum.COMPANY_LOGO
      }
    });

    return {
      ...companyInformation.at(0),
      media: {
        ...media
      }
    };
  }
}
