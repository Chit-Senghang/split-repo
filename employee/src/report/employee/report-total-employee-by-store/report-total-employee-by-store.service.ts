import { Inject, Injectable } from '@nestjs/common';
import { CompanyStructureRepository } from '../../../company-structure/repository/company-structure.repository';
import { ICompanyStructureRepository } from '../../../company-structure/repository/interface/company-structure.repository.interface';
import { EmployeeRepository } from '../../../employee/repository/employee.repository';
import { IEmployeeRepository } from '../../../employee/repository/interface/employee.repository.interface';
import { CompanyStructure } from '../../../company-structure/entities/company-structure.entity';
import { CompanyStructureTypeEnum } from '../../../company-structure/common/ts/enum/structure-type.enum';
import { ReportEnum } from '../../enums/report.enum';
import { ReportTotalEmployeeByStoreDto } from './dto/report-total-employee-by-store.dto';

@Injectable()
export class ReportTotalEmployeeByStoreService {
  constructor(
    @Inject(CompanyStructureRepository)
    private readonly companyStructureRepository: ICompanyStructureRepository,
    @Inject(EmployeeRepository)
    private readonly employeeRepository: IEmployeeRepository
  ) {}

  async getTotalEmployeeByStore(): Promise<ReportTotalEmployeeByStoreDto> {
    const companyStructures: CompanyStructure[] =
      await this.companyStructureRepository.getCompanyStructureByType(
        CompanyStructureTypeEnum.LOCATION
      );

    const totalCount = 0;
    let totalEmployeeAllLocations = 0;
    const reports = [];

    for (const companyStructure of companyStructures) {
      const { stores, totalEmployeeInLocation } =
        await this.mappingEmployeeInOutlet(companyStructure, totalCount);

      totalEmployeeAllLocations += totalEmployeeInLocation;
      reports.push({
        name: companyStructure.companyStructureComponent.name,
        totalCount: totalEmployeeInLocation,
        stores
      });
    }

    return {
      data: {
        reportId: ReportEnum.TOTAL_EMPLOYEE_IN_LOCATIONS,
        totalCount: totalEmployeeAllLocations,
        locations: reports
      }
    };
  }

  // =========================== [Private methods] ===========================
  private async mappingEmployeeInOutlet(
    companyStructure: CompanyStructure,
    totalCount: number
  ) {
    let totalEmployeeInStore = 0;
    return {
      stores: await Promise.all(
        companyStructure.children.map(async (outlet: CompanyStructure) => {
          // get number of employee in a store
          totalEmployeeInStore =
            await this.employeeRepository.getEmployeeByOutletId(outlet.id);

          totalCount += totalEmployeeInStore; // sum total employee

          return {
            name: outlet.companyStructureComponent.name,
            totalCount: totalEmployeeInStore
          };
        })
      ),
      totalEmployeeInLocation: totalCount
    };
  }
}
