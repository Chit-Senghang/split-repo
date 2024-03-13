import * as PERMISSION from '../../../../shared-resources/ts/enum/permission';

export const EMPLOYEE_WARNING = {
  GET_EMPLOYEE_WARNING: [
    PERMISSION.EMPLOYEE_WARNING_PERMISSION.READ_EMPLOYEE_WARNING,
    PERMISSION.SPECIAL_PERMISSION.ALL_FUNCTION,
    PERMISSION.SPECIAL_PERMISSION.READ_ALL_FUNCTION
  ],
  DELETE_EMPLOYEE_WARNING: [
    PERMISSION.EMPLOYEE_WARNING_PERMISSION.DELETE_EMPLOYEE_WARNING,
    PERMISSION.SPECIAL_PERMISSION.ALL_FUNCTION
  ],
  UPDATE_EMPLOYEE_WARNING: [
    PERMISSION.EMPLOYEE_WARNING_PERMISSION.UPDATE_EMPLOYEE_WARNING,
    PERMISSION.SPECIAL_PERMISSION.ALL_FUNCTION
  ],
  CREATE_EMPLOYEE_WARNING: [
    PERMISSION.EMPLOYEE_WARNING_PERMISSION.CREATE_EMPLOYEE_WARNING,
    PERMISSION.SPECIAL_PERMISSION.ALL_FUNCTION
  ]
};
