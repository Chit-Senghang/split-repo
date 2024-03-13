import * as PERMISSION from '../../../shared-resources/ts/enum/permission';

export const EMPLOYEE_MOVEMENT = {
  GET_EMPLOYEE_MOVEMENT: [
    PERMISSION.EMPLOYEE_MOVEMENT_PERMISSION.READ_EMPLOYEE_MOVEMENT,
    PERMISSION.SPECIAL_PERMISSION.ALL_FUNCTION,
    PERMISSION.SPECIAL_PERMISSION.READ_ALL_FUNCTION
  ],
  DELETE_EMPLOYEE_MOVEMENT: [
    PERMISSION.EMPLOYEE_MOVEMENT_PERMISSION.DELETE_EMPLOYEE_MOVEMENT,
    PERMISSION.SPECIAL_PERMISSION.ALL_FUNCTION
  ],
  UPDATE_EMPLOYEE_MOVEMENT: [
    PERMISSION.EMPLOYEE_MOVEMENT_PERMISSION.UPDATE_EMPLOYEE_MOVEMENT,
    PERMISSION.SPECIAL_PERMISSION.ALL_FUNCTION
  ],
  CREATE_EMPLOYEE_MOVEMENT: [
    PERMISSION.EMPLOYEE_MOVEMENT_PERMISSION.CREATE_EMPLOYEE_MOVEMENT,
    PERMISSION.SPECIAL_PERMISSION.ALL_FUNCTION
  ]
};
