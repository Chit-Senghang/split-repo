import { IRepositoryBase } from '../../../../shared-resources/base/repository/interface/base.repository.interface';
import { OvertimeRequest } from '../../entities/overtime-request.entity';

export interface IOvertimeRequestRepository
  extends IRepositoryBase<OvertimeRequest> {
  FindOneById(
    id: number,
    isValidate?: boolean
  ): Promise<OvertimeRequest | null>;
}
