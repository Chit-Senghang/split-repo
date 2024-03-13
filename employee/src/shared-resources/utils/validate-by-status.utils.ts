import { StatusEnum } from '../common/enums/status.enum';
import { ResourceForbiddenException } from '../exception/forbidden.exception';

export const validateByStatusActive = (status: string): void => {
  if (status === StatusEnum.ACTIVE) {
    throw new ResourceForbiddenException(
      `You can not update this record, because the status is ACTIVE.`
    );
  } else if (status === StatusEnum.REJECTED) {
    throw new ResourceForbiddenException(
      `You can not update this record, because the status is REJECTED.`
    );
  }
};
