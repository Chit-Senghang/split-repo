import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { Vaccination } from '../entities/vaccination.entity';
import { IVaccinationRepository } from './interface/vaccination.repository.interface';

@Injectable()
export class VaccinationRepository
  extends RepositoryBase<Vaccination>
  implements IVaccinationRepository
{
  constructor(protected readonly dataSource: DataSource) {
    super(dataSource.getRepository(Vaccination));
  }
}
