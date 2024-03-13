import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { GeographicTypeEnum } from '../database/data/geographic-type.enum';
import { Geographic } from '../geographic/entities/geographic.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { Code, CodeValue } from '../key-value/entity';
import { CodeTypesEnum } from '../key-value/ts/enums/permission.enum';
import { PaymentMethod } from '../payment-method/entities/payment-method.entity';
import { Vaccination } from '../vaccination/entities/vaccination.entity';
import { WorkingShift } from '../workshift-type/entities/working-shift.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeRepository } from './repository/employee.repository';
import { IEmployeeRepository } from './repository/interface/employee.repository.interface';

@Injectable()
export class ValidateEmployeeService {
  private readonly WORKING_SHIFT = 'working shift';

  private readonly PAYMENT_METHOD = 'payment method';

  private readonly INSURANCE = 'insurance';

  private readonly VACCINATION = 'vaccination';

  constructor(
    @InjectRepository(WorkingShift)
    private readonly workingShiftRepo: Repository<WorkingShift>,
    @InjectRepository(Geographic)
    private readonly geographicRepo: Repository<Geographic>,
    @InjectRepository(CodeValue)
    private readonly codeValueRepo: Repository<CodeValue>,
    @InjectRepository(Code)
    private readonly codeRepo: Repository<Code>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(Insurance)
    private readonly insuranceRepo: Repository<Insurance>,
    @InjectRepository(Vaccination)
    private readonly vaccinationRepo: Repository<Vaccination>,
    @Inject(EmployeeRepository)
    private readonly employeeRepo: IEmployeeRepository
  ) {}

  async checkWorkingShift(id: number) {
    const workingShift = await this.workingShiftRepo.findOneBy({ id });

    if (!workingShift) {
      throw new ResourceNotFoundException(this.WORKING_SHIFT, id);
    }
  }

  async checkGeographicLocation(
    id: number,
    msg: string,
    type: GeographicTypeEnum
  ) {
    const geographic = await this.geographicRepo.findOneBy({ id });
    if (!geographic) {
      throw new ResourceNotFoundException(msg, id);
    }
    let validateType: any;
    switch (type) {
      case GeographicTypeEnum.PROVINCE: {
        validateType = GeographicTypeEnum.PROVINCE;
        break;
      }
      case GeographicTypeEnum.DISTRICT: {
        validateType = GeographicTypeEnum.DISTRICT;
        break;
      }
      case GeographicTypeEnum.COMMUNE: {
        validateType = GeographicTypeEnum.COMMUNE;
        break;
      }
      case GeographicTypeEnum.VILLAGE: {
        validateType = GeographicTypeEnum.VILLAGE;
        break;
      }
      default:
        break;
    }
    if (geographic.geographicType !== validateType) {
      throw new ResourceNotFoundException(
        `${msg} of ${id} is not type of ${type}`
      );
    }
  }

  async checkValidationWithDifferentTables(
    createEmployee: CreateEmployeeDto | UpdateEmployeeDto
  ) {
    await this.checkWorkingShift(createEmployee.workingShiftId);
    if (createEmployee.placeOfBirthId) {
      await this.checkGeographicLocation(
        createEmployee.placeOfBirthId,
        'place of birth',
        GeographicTypeEnum.PROVINCE
      );
    }

    if (createEmployee.maritalStatusId) {
      await this.checkCodeValue(
        createEmployee.maritalStatusId,
        'marital status id',
        CodeTypesEnum.MARITAL_STATUS
      );
    }

    if (createEmployee.genderId) {
      await this.checkCodeValue(
        createEmployee.genderId,
        'gender id',
        CodeTypesEnum.GENDER
      );
    }

    if (createEmployee.addressVillageId) {
      await this.checkGeographicLocation(
        createEmployee.addressVillageId,
        'address village',
        GeographicTypeEnum.VILLAGE
      );
    }
    if (createEmployee.addressCommuneId) {
      await this.checkGeographicLocation(
        createEmployee.addressCommuneId,
        'address commune',
        GeographicTypeEnum.COMMUNE
      );
    }
    if (createEmployee.addressDistrictId) {
      await this.checkGeographicLocation(
        createEmployee.addressDistrictId,
        'address district',
        GeographicTypeEnum.DISTRICT
      );
    }

    if (createEmployee.addressProvinceId) {
      await this.checkGeographicLocation(
        createEmployee.addressProvinceId,
        'address province',
        GeographicTypeEnum.PROVINCE
      );
    }
    if (createEmployee.nationality) {
      await this.checkCodeValue(
        createEmployee.nationality,
        'nationality',
        CodeTypesEnum.NATIONALITY
      );
    }

    if (createEmployee.spouseId) {
      await this.checkCodeValue(
        createEmployee.spouseId,
        'spouse',
        CodeTypesEnum.RELATIONSHIP
      );
    }
  }

  async checkCodeValue(id: number, msg: string, type: CodeTypesEnum) {
    const codeValue = await this.codeValueRepo.findOne({
      where: { id: id, codeId: { code: type } },
      relations: { codeId: true }
    });

    if (!codeValue) {
      throw new ResourceNotFoundException(msg, id);
    }
    let temp: CodeTypesEnum;
    switch (type) {
      case CodeTypesEnum.RELATIONSHIP: {
        temp = CodeTypesEnum.RELATIONSHIP;
        break;
      }
      case CodeTypesEnum.NATIONALITY: {
        temp = CodeTypesEnum.NATIONALITY;
        break;
      }
      case CodeTypesEnum.EDUCATION_TYPE: {
        temp = CodeTypesEnum.EDUCATION_TYPE;
        break;
      }
      case CodeTypesEnum.LANGUAGE: {
        temp = CodeTypesEnum.LANGUAGE;
        break;
      }
      case CodeTypesEnum.TRAINING: {
        temp = CodeTypesEnum.TRAINING;
        break;
      }
      case CodeTypesEnum.SKILL: {
        temp = CodeTypesEnum.SKILL;
        break;
      }
      case CodeTypesEnum.MARITAL_STATUS: {
        temp = CodeTypesEnum.MARITAL_STATUS;
        break;
      }
      case CodeTypesEnum.GENDER: {
        temp = CodeTypesEnum.GENDER;
        break;
      }
      case CodeTypesEnum.DOCUMENT_TYPE: {
        temp = CodeTypesEnum.DOCUMENT_TYPE;
        break;
      }
      default:
        break;
    }
    const code = await this.codeRepo.findOne({
      where: { id: codeValue.codeId.id }
    });
    if (code.code !== temp) {
      throw new ResourceNotFoundException(
        `${msg} of ${id} is not type of ${type}`
      );
    }
  }

  async checkPaymentMethod(id: number) {
    const paymentMethod = await this.paymentMethodRepo.findOneBy({ id });
    if (!paymentMethod) {
      throw new ResourceNotFoundException(this.PAYMENT_METHOD, id);
    }
    return paymentMethod;
  }

  async checkInsurance(id: number) {
    const insurance = await this.insuranceRepo.findOneBy({ id });
    if (!insurance) {
      throw new ResourceNotFoundException(this.INSURANCE, id);
    }
  }

  async checkVaccination(id: number) {
    const vaccination = await this.vaccinationRepo.findOneBy({ id });
    if (!vaccination) {
      throw new ResourceNotFoundException(this.VACCINATION, id);
    }
  }

  async checkEmployeeByCurrentUserLogin(id: number) {
    return await this.employeeRepo.getEmployeeById(id);
  }
}
