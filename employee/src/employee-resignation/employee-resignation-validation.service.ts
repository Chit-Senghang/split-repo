import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { EmployeePosition } from '../employee-position/entities/employee-position.entity';
import { Code, CodeValue } from '../key-value/entity';
import { EmployeeResignationEnum } from './common/ts/enums/employee-resignation.enum';
import { EmployeeResignation } from './entity/employee-resignation.entity';

export class EmployeeResignationValidationService {
  private readonly CODE_VALUE = 'code value';

  private readonly CODE = 'code';

  private readonly EMPLOYEE_RESIGNATION = 'employee resignation';

  constructor(
    @InjectRepository(CodeValue)
    private readonly codeValueRepository: Repository<CodeValue>,
    @InjectRepository(Code)
    private readonly codeRepository: Repository<Code>,
    @InjectRepository(EmployeeResignation)
    private readonly employeeResignationRepo: Repository<EmployeeResignation>,
    @InjectRepository(EmployeePosition)
    private readonly employeePositionRepository: Repository<EmployeePosition>
  ) {}

  async validateEmployeePosition(employeeId: number) {
    const employeePosition = await this.employeePositionRepository.findOne({
      where: { employee: { id: employeeId }, isDefaultPosition: true },
      relations: { companyStructurePosition: { positionLevelId: true } }
    });
    if (!employeePosition) {
      throw new ResourceNotFoundException(
        `Resource employee position of employee ${employeeId} not found`
      );
    }
    return employeePosition;
  }

  async validateEmployeeResignation(id: number): Promise<EmployeeResignation> {
    const employeeResignation = await this.employeeResignationRepo.findOne({
      where: {
        id
      },
      relations: {
        employee: true,
        resignTypeId: true,
        reasonTemplate: true
      },
      select: {
        employee: {
          id: true,
          firstNameEn: true,
          lastNameEn: true,
          contractPeriodStartDate: true,
          contractPeriodEndDate: true
        },
        resignTypeId: { id: true, value: true },
        reasonTemplate: {
          id: true,
          type: true,
          name: true
        }
      }
    });
    if (!employeeResignation) {
      throw new ResourceNotFoundException(this.EMPLOYEE_RESIGNATION, id);
    }
    return employeeResignation;
  }

  async validateCodeValue(id: number): Promise<void> {
    const codeValue = await this.codeValueRepository.findOne({
      where: { id },
      relations: { codeId: true }
    });
    if (!codeValue) {
      throw new ResourceNotFoundException(this.CODE_VALUE, id);
    }
    const code = await this.codeRepository.findOneBy({
      id: codeValue.codeId.id
    });
    if (!code) {
      throw new ResourceNotFoundException(this.CODE, codeValue.codeId.id);
    }
    if (code.code !== EmployeeResignationEnum.RESIGNATION_TYPE) {
      throw new ResourceNotFoundException(
        `Resource code value of ${id} is not type of RESIGNATION_TYPE`
      );
    }
  }
}
