import { Injectable } from '@nestjs/common';
import {
  Between,
  DataSource,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  Raw,
  Repository
} from 'typeorm';
import {
  DEFAULT_MONTH_FORMAT,
  DEFAULT_YEAR_FORMAT
} from '../../shared-resources/common/dto/default-date-format';
import {
  dayJs,
  getCurrentDate
} from '../../shared-resources/common/utils/date-utils';
import { ResourceNotFoundException } from '../../shared-resources/exception';
import { getCurrentUserFromContext } from '../../shared-resources/utils/get-user-from-current-context.common';
import { WorkShiftTypeEnum } from '../../workshift-type/common/ts/enum/workshift-type.enum';
import { Employee } from '../entity/employee.entity';
import { EMPLOYEE_SELECTED_FIELDS } from '../constant/selected-fields.constant';
import { EMPLOYEE_RELATIONSHIP } from '../constant/relationship.constant';
import { RepositoryBase } from '../../shared-resources/base/repository/base.repository';
import { EmployeeActiveStatusEnum } from '../enum/employee-status.enum';
import { EmployeeAndUserTemplateDto } from '../dto/employee-user.dto';
import { GrpcService } from '../../grpc/grpc.service';
import { EmployeeCount } from '../type/employee-count.type';
import { IEmployeeRepository } from './interface/employee.repository.interface';

@Injectable()
export class EmployeeRepository
  extends RepositoryBase<Employee>
  implements IEmployeeRepository
{
  private readonly EMPLOYEE = 'employee';

  private employeeRepository: Repository<Employee>;

  private readonly EMPLOYEE_STATUS_AVAILABLE_CONDITION = In(
    Object.values(EmployeeActiveStatusEnum)
  );

  constructor(
    protected readonly dataSource: DataSource,
    private grpcService: GrpcService
  ) {
    super(dataSource.getRepository(Employee));
    this.employeeRepository = dataSource.getRepository(Employee);
  }

  async getEmployeeByIdForQuery(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      select: { id: true, userId: true }
    });
    if (!employee) {
      throw new ResourceNotFoundException(this.EMPLOYEE, id);
    }

    if (!employee.userId) {
      throw new ResourceNotFoundException(
        `Resource of employee ${id} does not have user yet.`
      );
    }

    return employee;
  }

  async getEmployeeWithUserTemplateByUserId(
    userId: number
  ): Promise<EmployeeAndUserTemplateDto> {
    const user = await this.grpcService.getUserById(userId);

    //set default employee template
    const employeeTemplate: EmployeeAndUserTemplateDto = {
      id: user.id,
      name: user.username,
      employee: null
    };

    // user is self-service set employee information into template
    if (user.isSelfService) {
      const employee = await this.employeeRepository.findOne({
        where: { userId },
        select: { id: true, displayFullNameEn: true }
      });
      if (employee) {
        employeeTemplate['employee'] = {
          id: employee.id,
          name: employee.displayFullNameEn
        };
      }
    }

    return employeeTemplate;
  }

  async totalEmployeeWorkAnniversaryCount(): Promise<number> {
    const currentMonth: number = getCurrentDate().month() + 1;
    const totalEmployeeWorkAnniversaryCount: EmployeeCount[] = await this
      .employeeRepository.query(`
        SELECT 
          COUNT(e.id)
        FROM 
          employee e
        WHERE 
          status IN ('${EmployeeActiveStatusEnum.ACTIVE}', '${EmployeeActiveStatusEnum.IN_PROBATION}')
          AND EXTRACT(MONTH FROM e.start_date) = ${currentMonth}
          AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.start_date)) > 0;
      `);
    return totalEmployeeWorkAnniversaryCount.at(0).count;
  }

  async totalEmployeeBirthdayCount(): Promise<number> {
    const currentMonth: number = getCurrentDate().month() + 1;
    const totalEmployeeBirthdayCount: EmployeeCount[] = await this
      .employeeRepository.query(`
        SELECT 
          COUNT(e.id) 
        FROM 
          employee e
        WHERE status IN('${EmployeeActiveStatusEnum.ACTIVE}', '${EmployeeActiveStatusEnum.IN_PROBATION}')
          AND EXTRACT(MONTH from e.dob)  = ${currentMonth}
          AND e.dob IS NOT NULL;
    `);
    return totalEmployeeBirthdayCount.at(0).count;
  }

  async findStartDateWithCurrentDate(): Promise<Employee[]> {
    const getMonth: string =
      dayJs(getCurrentDate()).format(DEFAULT_MONTH_FORMAT);
    const getYear: string = dayJs(getCurrentDate()).format(DEFAULT_YEAR_FORMAT);
    return await this.find({
      where: {
        resignDate: Raw(
          (startDate) =>
            `(EXTRACT(YEAR FROM ${startDate}) = ${getYear} 
            AND EXTRACT(MONTH FROM ${startDate}) = ${getMonth})`
        ),
        status: this.EMPLOYEE_STATUS_AVAILABLE_CONDITION
      }
    });
  }

  async findAllPostProbation(postProbationDate?: any): Promise<Employee[]> {
    const firstDayCurrentMonth: Date = dayJs()
      .utc(true)
      .startOf('month')
      .toDate();

    const currentDate: Date = dayJs().utc(true).startOf('date').toDate();
    return await this.find({
      where: {
        postProbationDate: postProbationDate
          ? Between(firstDayCurrentMonth, postProbationDate)
          : Between(firstDayCurrentMonth, currentDate),
        status: this.EMPLOYEE_STATUS_AVAILABLE_CONDITION
      },
      relations: {
        gender: true
      },
      select: {
        id: true,
        employmentType: true,
        postProbationDate: true,
        status: true,
        startDate: true,
        gender: {
          id: true,
          value: true
        }
      }
    });
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await this.find({
      where: {
        status: this.EMPLOYEE_STATUS_AVAILABLE_CONDITION
      },
      relations: {
        gender: true
      },
      select: {
        id: true,
        employmentType: true,
        postProbationDate: true,
        status: true,
        startDate: true,
        gender: {
          id: true,
          value: true
        }
      }
    });
  }

  findOptionsSelect = {
    id: true,
    accountNo: true,
    fingerPrintId: true,
    firstNameEn: true,
    lastNameEn: true,
    lastNameKh: true,
    firstNameKh: true,
    displayFullNameKh: true,
    displayFullNameEn: true,
    startDate: true,
    postProbationDate: true,
    resignDate: true,
    contractType: true,
    contractPeriodStartDate: true,
    contractPeriodEndDate: true,
    employmentType: true,
    dob: true,
    age: true,
    email: true,
    spouseOccupation: true,
    numberOfChildren: true,
    addressHomeNumber: true,
    addressStreetNumber: true,
    taxResponsible: true,
    status: true,
    attendanceAllowanceInProbation: false,
    gender: {
      id: true,
      value: true,
      valueInKhmer: true
    },
    workingShiftId: {
      id: true,
      name: true
    },
    positions: {
      id: true,
      isDefaultPosition: true,
      mpath: true,
      isMoved: false,
      companyStructureCompany: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true,
          nameKh: true
        }
      },
      companyStructureLocation: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true,
          nameKh: true
        }
      },
      companyStructureOutlet: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true,
          nameKh: true
        }
      },
      companyStructureDepartment: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true,
          nameKh: true
        }
      },
      companyStructureTeam: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true,
          nameKh: true
        }
      },
      companyStructurePosition: {
        id: true,
        companyStructureComponent: {
          id: true,
          name: true,
          nameKh: true
        }
      }
    }
  } as FindOptionsSelect<Employee>;

  findOptionsRelations = {
    workingShiftId: true,
    contacts: true,
    gender: true,
    positions: {
      companyStructureCompany: {
        companyStructureComponent: true
      },
      companyStructureLocation: {
        companyStructureComponent: true
      },
      companyStructureOutlet: {
        companyStructureComponent: true
      },
      companyStructureDepartment: {
        companyStructureComponent: true
      },
      companyStructureTeam: {
        companyStructureComponent: true
      },
      companyStructurePosition: {
        companyStructureComponent: true
      }
    }
  } as FindOptionsRelations<Employee>;

  async getEmployeeByAccountNumberForImport(
    accountNo: string
  ): Promise<Employee> {
    return await this.employeeRepository.findOne({
      where: {
        accountNo,
        status: this.EMPLOYEE_STATUS_AVAILABLE_CONDITION
      },
      select: {
        id: true,
        displayFullNameEn: true,
        accountNo: true,
        status: true,
        employmentType: true,
        startDate: true,
        gender: {
          id: true
        }
      },
      relations: {
        gender: true
      }
    });
  }

  async getEmployeeByOutletId(outletId: number): Promise<number> {
    const [, count] = await this.findAndCount({
      where: {
        positions: { companyStructureOutlet: { id: outletId } },
        status: this.EMPLOYEE_STATUS_AVAILABLE_CONDITION
      },
      select: {
        id: true,
        positions: {
          id: true,
          companyStructureOutlet: {
            id: true
          }
        }
      },
      relations: {
        positions: {
          companyStructureOutlet: true
        }
      }
    });

    return count;
  }

  async totalAllEmployee(): Promise<Employee[]> {
    return await this.find({
      where: {
        status: this.EMPLOYEE_STATUS_AVAILABLE_CONDITION
      },
      select: {
        id: true
      }
    });
  }

  /**
   * Function is used to employee of current user
   */
  async getEmployeeOfCurrentUser(isValidate = true): Promise<Employee> {
    const userId: number = getCurrentUserFromContext();
    return await this.getEmployeeByUserId(userId, isValidate);
  }

  /**
   * Function is used to get all employee base on provided condition
   */
  async getAllEmployeeByProvidedCondition(
    whereCondition: FindOptionsWhere<Employee>
  ): Promise<Employee[]> {
    return await this.find({
      where: whereCondition,
      select: EMPLOYEE_SELECTED_FIELDS,
      relations: EMPLOYEE_RELATIONSHIP
    });
  }

  /**
   * Function is used to get employee by id with loading all relationships of employee.
   * When isValidate is provided, if not employee found, throws error.
   * @param id
   * @param isValidated Optional
   */
  async getEmployeeById(id: number): Promise<Employee> {
    const whereCondition = {
      id,
      positions: { isMoved: false }
    } as FindOptionsWhere<Employee>;

    return await this.getEmployeeByCondition(whereCondition);
  }

  async getEmployeeByIdAndByDefaultPosition(id: number): Promise<Employee> {
    const whereCondition = {
      id,
      positions: { isDefaultPosition: true, isMoved: false }
    } as FindOptionsWhere<Employee>;

    return this.getEmployeeByCondition(whereCondition);
  }

  /**
   * Function is used to get employee by userId.
   * If not found. throw error.
   * @param userId
   * @returns Promise Employee
   */
  async getEmployeeByUserId(
    userId: number,
    isValidated?: boolean
  ): Promise<Employee> {
    const whereCondition = {
      userId: userId,
      positions: { isMoved: false }
    } as FindOptionsWhere<Employee>;

    return await this.getEmployeeByCondition(whereCondition, isValidated);
  }

  /**
   * This function is used to get one employee by provided condition.
   * If not found. throw error.
   * @param whereCondition
   * @returns Promise Employee
   */
  async getOneEmployeeByProvidedCondition(
    whereCondition: FindOptionsWhere<Employee>
  ): Promise<Employee> {
    return await this.getEmployeeByCondition(whereCondition);
  }

  async findEmployeeByWorkShiftTypeAndId(
    workshiftType: WorkShiftTypeEnum,
    employeeId?: number
  ): Promise<Employee[]> {
    return this.find({
      where: {
        id: employeeId,
        status: this.EMPLOYEE_STATUS_AVAILABLE_CONDITION,
        workingShiftId: {
          workshiftType: {
            name: workshiftType
          }
        }
      },
      relations: {
        workingShiftId: {
          workshiftType: true
        }
      }
    });
  }

  // ======================== [Private block functions] ========================

  private async getEmployeeByCondition(
    whereCondition: FindOptionsWhere<Employee>,
    isValidated = true
  ) {
    const employee: Employee | null = await this.findOne({
      where: whereCondition,
      select: EMPLOYEE_SELECTED_FIELDS,
      relations: EMPLOYEE_RELATIONSHIP
    });

    if (!employee && isValidated) {
      throw new ResourceNotFoundException(
        `Resource of ${this.EMPLOYEE} not found.`
      );
    }

    return employee;
  }
}
