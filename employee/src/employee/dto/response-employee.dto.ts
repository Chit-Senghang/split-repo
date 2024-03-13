import { plainToClass } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { Employee } from '../entity/employee.entity';

export class ResponseEmployeeDto extends PartialType(Employee) {
  location: string;

  outlet: string;

  department: string;

  team: string;

  position: string;

  get getLocation(): string {
    return this.positions?.at(0)?.companyStructureLocation
      ?.companyStructureComponent?.name;
  }

  get getOutLet(): string {
    return this.positions?.at(0)?.companyStructureOutlet
      ?.companyStructureComponent?.name;
  }

  get getDepartment(): string {
    return this.positions?.at(0)?.companyStructureDepartment
      ?.companyStructureComponent?.name;
  }

  get getTeam(): string {
    return this.positions?.at(0)?.companyStructureTeam
      ?.companyStructureComponent?.name;
  }

  get getPosition(): string {
    return this.positions?.at(0)?.companyStructurePosition
      ?.companyStructureComponent?.name;
  }

  private invokeGetter() {
    this.location = this.getLocation;

    this.outlet = this.getOutLet;

    this.department = this.getDepartment;

    this.team = this.getTeam;

    this.position = this.getPosition;

    delete this.positions;

    return this;
  }

  static fromEntity(employee?: Employee): ResponseEmployeeDto {
    const responseEmployeeDto = plainToClass(ResponseEmployeeDto, employee);
    return responseEmployeeDto.invokeGetter();
  }
}
