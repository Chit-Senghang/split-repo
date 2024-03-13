import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { exportDataFiles } from '../shared-resources/export-file/common/function/export-data-files';
import { ExportFileDto } from '../shared-resources/export-file/dto/export-file.dto';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { DataTableNameEnum } from '../shared-resources/export-file/common/enum/data-table-name.enum';
import { handleResourceConflictException } from '../shared-resources/common/utils/handle-resource-conflict-exception';
import { vaccinationConstraint } from '../shared-resources/ts/constants/resource-exception-constraints';
import { Vaccination } from './entities/vaccination.entity';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { VaccinationPaginationDto } from './dto/pagination-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';

@Injectable()
export class VaccinationService {
  private readonly VACCINATION_NAME = 'vaccination name';

  constructor(
    @InjectRepository(Vaccination)
    private readonly vaccinationNameRepo: Repository<Vaccination>
  ) {}

  async create(
    createVaccinationNameDto: CreateVaccinationDto
  ): Promise<Vaccination> {
    try {
      const checkName = createVaccinationNameDto.name.trim();
      return this.vaccinationNameRepo.save(
        this.vaccinationNameRepo.create({
          name: checkName
        })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        vaccinationConstraint,
        createVaccinationNameDto
      );
    }
  }

  async findAll(pagination: VaccinationPaginationDto) {
    return GetPagination(this.vaccinationNameRepo, pagination, ['name']);
  }

  async exportFile(
    pagination: VaccinationPaginationDto,
    exportFileDto: ExportFileDto
  ) {
    const { data } = await this.findAll(pagination);
    return await exportDataFiles(
      pagination.exportFileType,
      DataTableNameEnum.VACCINATION,
      exportFileDto,
      data
    );
  }

  async findOne(id: number): Promise<Vaccination> {
    const vaccinationName = await this.vaccinationNameRepo.findOneBy({
      id
    });
    if (!vaccinationName) {
      throw new ResourceNotFoundException(this.VACCINATION_NAME, `id ${id}`);
    }
    return vaccinationName;
  }

  async update(
    id: number,
    updateInsuranceNameDto: UpdateVaccinationDto
  ): Promise<
    Vaccination & {
      name: string;
    }
  > {
    try {
      const trimVaccinationName = updateInsuranceNameDto.name.trim();
      const insuranceName = await this.findOne(id);
      return this.vaccinationNameRepo.save(
        Object.assign(insuranceName, {
          name: trimVaccinationName
        })
      );
    } catch (exception) {
      handleResourceConflictException(
        exception,
        vaccinationConstraint,
        updateInsuranceNameDto
      );
    }
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    await this.vaccinationNameRepo.delete(id);
  }
}
