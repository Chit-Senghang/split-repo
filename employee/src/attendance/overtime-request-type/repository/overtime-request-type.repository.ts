import { Injectable } from '@nestjs/common';
import { RepositoryBase } from '../../../shared-resources/base/repository/base.repository';
import { OvertimeRequestType } from '../entities/overtime-request-type.entity';
import { IOvertimeRequestTypeRepository } from './interface/overtime-request-type.repository.interface';

@Injectable()
export class OvertimeRequestTypeRepository
  extends RepositoryBase<OvertimeRequestType>
  implements IOvertimeRequestTypeRepository {}
