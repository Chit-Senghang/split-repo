// import { Employee } from '../../employee/src/employee/entity/employee.entity';
import { User } from '../proto/authentication/authentication.pb';

export const createdByMapping = (user: User, employee: any) => {
  return {
    createdBy: {
      id: user.id,
      username: user.username,
      employee: employee
        ? {
            id: employee.id,
            accountNo: employee.accountNo,
            displayNameEn: employee.displayFullNameEn,
            displayNameKh: employee.displayFullNameKh
          }
        : null
    }
  };
};
