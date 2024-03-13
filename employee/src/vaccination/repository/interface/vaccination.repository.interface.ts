import { IRepositoryBase } from '../../../shared-resources/base/repository/interface/base.repository.interface';
import { Vaccination } from '../../entities/vaccination.entity';

export interface IVaccinationRepository extends IRepositoryBase<Vaccination> {}
