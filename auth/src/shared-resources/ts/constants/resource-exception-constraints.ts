import { IResourceException } from '../interface/resource-exception.interface';

export const benefitAdjustmentTypeConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_name'
  }
];

export const attendanceReportConstraint: IResourceException[] = [
  {
    path: 'employeeId,date',
    key: 'unique_attendance_employee'
  }
];

export const benefitComponentConstraint: IResourceException[] = [
  {
    path: 'name,benefitComponentTypeId',
    key: 'uk_salary_component_type_id_name'
  },
  { path: 'name', key: 'uk_benefit_component_name' }
];

export const benefitComponentTypeConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_salary_component_type_name'
  }
];

export const benefitIncrementPolicyConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_name_benefit_increasement_policy'
  },
  {
    path: 'benefitIncrementPolicyId,benefitComponentId',
    key: 'uk_benefit_increasement_policy_id_benefit_component_id',
    arrayProperty: 'detail'
  }
];

export const codeConstraint: IResourceException[] = [
  {
    path: 'code',
    key: 'uk_key_code'
  },
  {
    path: 'code',
    key: 'uk_code_code'
  }
];

export const codeValueConstraint: IResourceException[] = [
  {
    path: 'value,codeId',
    key: 'uk_code_value_code'
  }
];

export const companyStructureConstraint: IResourceException[] = [
  {
    path: 'parentId,companyStructureComponentId',
    key: 'uk_company_structure_component_id_parent_id'
  }
];

export const companyStructureComponentConstraint: IResourceException[] = [
  {
    path: 'type,name',
    key: 'uk_name_type'
  }
];

export const dayOffRequestConstraint: IResourceException[] = [
  {
    path: 'employeeId',
    key: 'uk_employee_id_iday_off_date',
    arrayProperty: 'dayOffDate'
  }
];

export const employeeConstraint: IResourceException[] = [
  {
    path: 'accountNo',
    key: 'uk_employee_account_no'
  },
  {
    path: 'email',
    key: 'uk_employee_email'
  },
  {
    path: 'fingerPrintId',
    key: 'uk_employee_finger_print_id'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_contact_contact',
    arrayProperty: 'contacts'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_contact_employee_id_contact_is_default',
    arrayProperty: 'contacts'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_id_contact_deleted_at',
    arrayProperty: 'emergencyContacts'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_contact_employee_id_contact_is_default',
    arrayProperty: 'emergencyContacts'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_id_identifier_document_type_id_document_identifier',
    arrayProperty: 'identifiers'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_bank_account_employee_id_bank_id',
    arrayProperty: 'paymentMethodAccounts'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_bank_account_employee_id_account_number_bank_id',
    arrayProperty: 'paymentMethodAccounts'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_bank_account_is_default_account_employee_id',
    arrayProperty: 'paymentMethodAccounts'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_insurance_employee_id_insurance_id_deleted_at',
    arrayProperty: 'insuranceCards'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_insurance_employee_id_insurance_id_card_number_dele',
    arrayProperty: 'insuranceCards'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_vaccination_employee_id_vaccination_id',
    arrayProperty: 'vaccinationCards'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_vaccination_employee_id_vaccination_id_card_number',
    arrayProperty: 'vaccinationCards'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_id_education_type_id',
    arrayProperty: 'educations'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_position_employee_company_structure_position_is_mov',
    arrayProperty: 'positions'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_id_language_id',
    arrayProperty: 'languages'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_id_training_id',
    arrayProperty: 'trainings'
  },
  {
    path: 'employeeId',
    key: 'uk_employee_id_skill_id',
    arrayProperty: 'skills'
  }
];

export const employeeContactConstraint: IResourceException[] = [
  {
    path: 'employeeId,contact',
    key: 'uk_employee_id_contact_deleted_at'
  },
  {
    path: 'employeeId,contact,isDefault',
    key: 'uk_employee_contact_employee_id_contact_is_default'
  },
  {
    path: 'employeeId, isDefault',
    key: 'uk_employee_id_is_default'
  }
];

export const employeeEducationConstraint: IResourceException[] = [
  {
    path: 'employeeId,educationTypeId',
    key: 'uk_employee_id_education_type_id'
  }
];

export const employeeEmergencyContactConstraint: IResourceException[] = [
  {
    path: 'employeeId,contact',
    key: 'uk_employee_emergency_contact_employee_id_contact'
  }
];

export const employeeIdentifierConstraint: IResourceException[] = [
  {
    path: 'employeeId,documentTypeId,documentIdentifier',
    key: 'uk_employee_id_identifier_document_type_id_document_identifier'
  }
];

export const employeeInsuranceConstraint: IResourceException[] = [
  {
    path: 'employeeId,insuranceId',
    key: 'uk_employee_insurance_employee_id_insurance_id_deleted_at'
  },
  {
    path: 'employeeId,insuranceId,cardNumber',
    key: 'uk_employee_insurance_employee_id_insurance_id_card_number_dele'
  }
];

export const employeeLanguageConstraint: IResourceException[] = [
  {
    path: 'employeeId,languageId',
    key: 'uk_employee_id_language_id'
  }
];

export const employeeNssfConstraint: IResourceException[] = [
  {
    path: 'employeeId,date',
    key: 'uk_nssf_emp_date'
  }
];

export const employeePaymentMethodAccountConstraint: IResourceException[] = [
  {
    path: 'employeeId,paymentMethodId',
    key: 'uk_employee_bank_account_employee_id_bank_id'
  },
  {
    path: 'employeeId,paymentMethodId,accountNumber',
    key: 'uk_employee_bank_account_employee_id_account_number_bank_id'
  },
  {
    path: 'employeeId,isDefaultAccount',
    key: 'uk_employee_bank_account_is_default_account_employee_id'
  }
];

export const employeePositionConstraint: IResourceException[] = [
  {
    path: 'employeeId,companyStructurePositionId,isMoved',
    key: 'uk_employee_position_employee_company_structure_position_is_mov'
  }
];

export const employeeResignationTypeConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_employee_resignation_type_name'
  }
];

export const employeeSkillConstraint: IResourceException[] = [
  {
    path: 'employeeId,skillId',
    key: 'uk_employee_id_skill_id'
  }
];

export const employeeTrainingConstraint: IResourceException[] = [
  {
    path: 'employeeId,trainingId',
    key: 'uk_employee_id_training_id'
  }
];

export const employeeMovementConstraint: IResourceException[] = [
  {
    path: 'employeeId,employeePositionId,companyStructureId',
    key: 'uk_employee_movement_employee_new_company_structure_position'
  }
];

export const employeeVaccinationConstraint: IResourceException[] = [
  {
    path: 'employeeId,vaccinationId',
    key: 'uk_employee_vaccination_employee_id_vaccination_id'
  },
  {
    path: 'employeeId,vaccinationId,cardNumber',
    key: 'uk_employee_vaccination_employee_id_vaccination_id_card_number'
  }
];

export const employeeWorkingScheduleConstraint: IResourceException[] = [
  {
    path: 'employeeId,scheduleDate',
    key: 'unique_month_id'
  }
];

export const fingerprintDeviceConstraint: IResourceException[] = [
  {
    path: 'ipAddress',
    key: 'unique_ip_address'
  }
];

export const insuranceConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_insurance_name_name'
  }
];

export const leaveConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_leave_request_type_name'
  },
  {
    path: 'leaveTypeId,employeeId,year',
    key: 'uk_emp_leave_type'
  },
  {
    path: 'leaveTypeName',
    key: 'uk_leave_type_name'
  },
  {
    path: 'leaveTypeId,employmentType,employeeStatus,genderId',
    key: 'uk_leave_id_gender_emp_type_emp_status'
  }
];

export const missionRequestConstraint: IResourceException[] = [
  {
    path: 'employeeId,durationType,fromDate,toDate',
    key: 'uk_employee_id_duration_type_from_date_to_date_mission_request'
  }
];

export const overtimeRequestTypeConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_overtime_request_type_name'
  }
];

export const paymentMethodConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_payment_method_name'
  }
];

export const payrollConstraint: IResourceException[] = [
  {
    path: 'employeeId,salaryComponentId,type',
    key: 'uk_salary_component_id_employee_id_type'
  },
  {
    path: 'id',
    key: 'payroll_benefit_adjustment_pkey'
  },
  {
    path: 'name',
    key: 'uk_payroll_deduction_type_name'
  },
  {
    path: 'date',
    key: 'uk_date'
  },
  {
    path: 'employeeId,date',
    key: 'uk_emp_date'
  },
  {
    path: 'employeeId,benefitComponentId',
    key: 'uk_employee_post_probation_salary_employee_salary_component'
  },
  {
    path: 'payrollBenefitAdjustmentId',
    key: 'uk_payroll_adjustment_salary_component',
    arrayProperty: 'detail'
  }
];

export const positionLevelConstraint: IResourceException[] = [
  {
    path: 'levelTitle',
    key: 'uk_position_level_level_title'
  },
  {
    path: 'levelNumber',
    key: 'uk_position_level_level_number'
  }
];

export const publicHolidayConstraint: IResourceException[] = [
  {
    path: 'date',
    key: 'uk_public_holiday_date'
  }
];

export const reasonTemplateConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_reason_template'
  }
];

export const requestApprovalWorkflowLevelConstraint: IResourceException[] = [
  {
    path: 'requestApprovalWorkflowId,positionLevelId,companyStructureDepartmentId,type',
    key: 'uk_request_approval_workflow_level_position_level',
    arrayProperty: [
      'requesters',
      'requestFors',
      'firstApprovers',
      'secondApprovers',
      'acknowledgers'
    ]
  }
];

export const requestWorkFlowTypeConstraint: IResourceException[] = [
  {
    path: 'requestType',
    key: 'uk_request_work_flow_type_request_type'
  }
];

export const vaccinationConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_vaccination_name_name'
  }
];

export const warningTypeConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_warning_type_name'
  }
];

export const workingShiftConstraint: IResourceException[] = [
  {
    path: 'workshiftTypeId,name',
    key: 'uk_workshift_type_name'
  }
];

export const workShiftTypeConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_name_workshift_type'
  }
];

export const permissionConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_permission_name'
  },
  {
    path: 'name,parentId',
    key: 'uk_permission_name_parent'
  }
];

export const roleConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'uk_role_role_name'
  },
  {
    path: 'roleId',
    key: 'uk_role_permission_permission_role',
    arrayProperty: 'permissionId'
  }
];

export const userConstraint: IResourceException[] = [
  {
    path: 'phone',
    key: 'uk_user_phone'
  },
  {
    path: 'email',
    key: 'uk_user_email'
  },
  {
    path: 'userId',
    key: 'user_role_constrain',
    arrayProperty: 'roles'
  },
  {
    path: 'consumerId',
    key: 'uk_user_consumer_consumer_id'
  },
  {
    path: 'userId',
    key: 'REL_1426e777516426223cd5193ed0'
  }
];

export const globalConfigurationConstraint: IResourceException[] = [
  {
    path: 'name',
    key: 'global_configuration_name_key'
  }
];
