import {
  Between,
  DataSource,
  FindOptionsWhere,
  Raw,
  Repository
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  dayJs,
  getCurrentDateWithFormat,
  getCurrentYear
} from '../../../shared-resources/common/utils/date-utils';
import { ResourceNotFoundException } from '../../../shared-resources/exception';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../../../shared-resources/common/dto/default-date-format';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { PublicHoliday } from '../entities/public-holiday.entity';
import { IPublicHolidayRepository } from './interface/public-holiday.repository.interface';

@Injectable()
export class PublicHolidayRepository
  extends RepositoryBase<PublicHoliday>
  implements IPublicHolidayRepository
{
  private readonly PUBLIC_HOLIDAY = 'public holiday';

  private readonly NOT_FOUND_MESSAGE = 'Resource of public holiday not found.';

  private readonly publicHolidayRepository: Repository<PublicHoliday>;

  constructor(dataSource: DataSource) {
    super(dataSource.getRepository(PublicHoliday));
    this.publicHolidayRepository = dataSource.getRepository(PublicHoliday);
  }

  async getPublicHolidayByCondition(
    whereCondition: FindOptionsWhere<PublicHoliday>
  ): Promise<PublicHoliday> {
    return await this.getPublicHolidayByProvidedCondition(whereCondition);
  }

  async getPublicHolidayBetweenDates(
    fromDate: string,
    toDate: string
  ): Promise<PublicHoliday[]> {
    const formattedFromDate: any = dayJs(fromDate)
      .startOf('month')
      .format(DEFAULT_DATE_FORMAT);
    const formattedToDate: any = dayJs(toDate)
      .endOf('month')
      .format(DEFAULT_DATE_FORMAT);
    const whereCondition = {
      date: Between(formattedFromDate, formattedToDate)
    } as FindOptionsWhere<PublicHoliday>;
    return await this.publicHolidayRepository.find({ where: whereCondition });
  }

  async getPublicHolidayInCurrentYear(): Promise<PublicHoliday[]> {
    const currentDate: any = getCurrentDateWithFormat();

    return await this.publicHolidayRepository.find({
      where: {
        date: Raw(
          (date) =>
            `TO_CHAR(${date}, 'YYYY') = '${dayJs(currentDate).format(
              DEFAULT_YEAR_FORMAT
            )}'`
        )
      }
    });
  }

  async totalPublicHolidayCount(dateInput: Date): Promise<PublicHoliday[]> {
    const currentYear = getCurrentYear();
    return await this.publicHolidayRepository.find({
      where: {
        date: dateInput
          ? Raw(
              (date) =>
                `TO_CHAR(${date}, '${DEFAULT_YEAR_FORMAT}') = '${dateInput}'`
            )
          : Raw(
              (date) =>
                `TO_CHAR(${date}, '${DEFAULT_YEAR_FORMAT}') = '${currentYear}'`
            )
      }
    });
  }

  // ========================= [Private block function] =========================
  private async getPublicHolidayByProvidedCondition(
    optionWhere: FindOptionsWhere<PublicHoliday>
  ): Promise<PublicHoliday> {
    const publicHoliday: PublicHoliday | null = await this.findOne({
      where: optionWhere
    });

    if (!publicHoliday) {
      throw new ResourceNotFoundException(
        this.PUBLIC_HOLIDAY,
        this.NOT_FOUND_MESSAGE
      );
    }

    return publicHoliday;
  }
}
