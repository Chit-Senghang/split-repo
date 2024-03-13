import { FindOptionsWhere } from 'typeorm';
import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { PublicHoliday } from '../../entities/public-holiday.entity';

export interface IPublicHolidayRepository
  extends IRepositoryBase<PublicHoliday> {
  getPublicHolidayInCurrentYear(): Promise<PublicHoliday[]>;
  getPublicHolidayBetweenDates(
    fromDate: string | undefined,
    toDate: string | undefined
  ): Promise<PublicHoliday[]>;
  getPublicHolidayByCondition(
    whereCondition: FindOptionsWhere<PublicHoliday>
  ): Promise<PublicHoliday>;

  totalPublicHolidayCount(year: Date): Promise<PublicHoliday[]>;
}
