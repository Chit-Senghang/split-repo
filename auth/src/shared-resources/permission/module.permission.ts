import {
  EMPLOYEE_MASTER_INFORMATION_PERMISSION,
  EMPLOYEE_RESIGNATION_PERMISSION,
  EMPLOYEE_MOVEMENT_PERMISSION,
  EMPLOYEE_STATUS_PERMISSION,
  EMPLOYEE_WARNING_PERMISSION,
  JOB_TITLE_PERMISSION,
  CODE_VALUE_PERMISSION,
  EMPLOYEE_PAYGRADE_PERMISSION,
  EMPLOYEE_QUALIFICATION_PERMISSION,
  COMPANY_STRUCTURE_PERMISSION,
  PERMISSION,
  USER_PERMISSION,
  ROLE_PERMISSION,
  ROLE_PERMISSION_PERMISSION,
  AUTHENTICATION_PERMISSION,
  GLOBAL_CONFIGURATION_PERMISSION
} from '../ts/enum/permission';

export const Module = [
  {
    name: 'AUTHENTICATION_MODULE',
    sub: [
      {
        name: 'PERMISSION',
        permission: Object.keys(PERMISSION)
      },
      {
        name: 'USER',
        permission: Object.keys(USER_PERMISSION)
      },
      {
        name: 'ROLE',
        permission: Object.keys(ROLE_PERMISSION)
      },
      {
        name: 'ROLE_PERMISSION',
        permission: Object.keys(ROLE_PERMISSION_PERMISSION)
      },
      {
        name: 'AUTHENTICATION',
        permission: Object.keys(AUTHENTICATION_PERMISSION)
      },
      {
        name: 'GLOBAL_CONFIGURATION_PERMISSION',
        permission: Object.keys(GLOBAL_CONFIGURATION_PERMISSION)
      }
    ]
  },
  {
    name: 'EMPLOYEE_MODULE',
    sub: [
      {
        name: 'EMPLOYEE_MASTER_INFORMATION',
        permission: Object.keys(EMPLOYEE_MASTER_INFORMATION_PERMISSION)
      },
      {
        name: 'EMPLOYEE_MOVEMENT',
        permission: Object.keys(EMPLOYEE_MOVEMENT_PERMISSION)
      },
      {
        name: 'EMPLOYEE_RESIGNATION',
        permission: Object.keys(EMPLOYEE_RESIGNATION_PERMISSION)
      },
      {
        name: 'EMPLOYEE_STATUS',
        permission: Object.keys(EMPLOYEE_STATUS_PERMISSION)
      },
      {
        name: 'EMPLOYEE_WARNING',
        permission: Object.keys(EMPLOYEE_WARNING_PERMISSION)
      },

      {
        name: 'JOB_TITLE',
        permission: Object.keys(JOB_TITLE_PERMISSION)
      },

      {
        name: 'KEY_VALUE',
        permission: Object.keys(CODE_VALUE_PERMISSION)
      },

      {
        name: 'PAY_GRADE',
        permission: Object.keys(EMPLOYEE_PAYGRADE_PERMISSION)
      },

      {
        name: 'QUALIFICATION',
        permission: Object.keys(EMPLOYEE_QUALIFICATION_PERMISSION)
      },
      {
        name: 'COMPANY_STRUCTURE',
        permission: Object.keys(COMPANY_STRUCTURE_PERMISSION)
      }
    ]
  }
];
