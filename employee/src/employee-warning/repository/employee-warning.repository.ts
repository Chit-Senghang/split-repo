import { Between, DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeWarning } from '../entities/employee-warning.entity';
import { GrpcService } from '../../grpc/grpc.service';
import { EmployeeWarningStatusEnum } from '../common/ts/enum/status.enum';
import { DEFAULT_DATE_FORMAT } from '../../shared-resources/common/dto/default-date-format';
import { dayJs } from '../../shared-resources/common/utils/date-utils';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { IEmployeeWarning } from './interface/employee-warning.repository.interface';

@Injectable()
export class EmployeeWarningRepository
  extends RepositoryBase<EmployeeWarning>
  implements IEmployeeWarning
{
  private readonly EMPLOYEE_WARNING = 'employee warning';

  private readonly employeeWarningRepository: Repository<EmployeeWarning>;

  constructor(
    protected readonly dataSource: DataSource,
    private readonly grpcService: GrpcService
  ) {
    super(dataSource.getRepository(EmployeeWarning));
    this.employeeWarningRepository =
      this.dataSource.getRepository(EmployeeWarning);
  }

  async getEmployeeWarningById(id: number): Promise<EmployeeWarning> {
    return await this.getOneWithNotFound(id);
  }

  async countWarning(
    warningDate: string,
    warningTypeId: number,
    employeeId: number
  ): Promise<number> {
    const resetByYear = await this.grpcService.getGlobalConfigurationByName({
      name: 'enable-employee-warning-reset-by-year'
    });

    const { fromDate, toDate }: any = this.getDateRange(
      resetByYear.isEnable,
      warningDate
    );

    const employeeWarning = await this.employeeWarningRepository.findOne({
      where: {
        employee: { id: employeeId },
        warningTypeId: { id: warningTypeId },
        warningDate: Between(fromDate, toDate),
        status: EmployeeWarningStatusEnum.ACTIVE
      },
      order: { id: 'DESC' },
      relations: {
        employee: true,
        warningTypeId: true
      }
    });

    if (!employeeWarning) {
      return 0;
    }

    return employeeWarning.count;
  }

  // ========================= [Private methods] =========================
  private getDateRange(
    resetByYear: boolean,
    requestDate: string
  ): {
    fromDate: string;
    toDate: string;
  } {
    let fromDate: string;
    let toDate: string;
    if (resetByYear) {
      fromDate = dayJs(requestDate).startOf('year').format(DEFAULT_DATE_FORMAT);
      toDate = dayJs(requestDate).endOf('year').format(DEFAULT_DATE_FORMAT);
    }
    fromDate = dayJs(requestDate).startOf('month').format(DEFAULT_DATE_FORMAT);

    toDate = dayJs(requestDate).endOf('month').format(DEFAULT_DATE_FORMAT);

    return { fromDate, toDate };
  }

  private async getOneWithNotFound(id: number): Promise<EmployeeWarning> {
    const employeeWarning: EmployeeWarning | null =
      await this.employeeWarningRepository.findOne({
        where: {
          id
        },
        relations: { warningTypeId: true, employee: true },
        select: { warningTypeId: { id: true }, employee: { id: true } }
      });

    if (!employeeWarning) {
      throw new ResourceNotFoundException(this.EMPLOYEE_WARNING, id);
    }

    return employeeWarning;
  }
}
