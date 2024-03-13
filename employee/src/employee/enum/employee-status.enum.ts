export enum EmployeeStatusEnum {
  ACTIVE = 'ACTIVE',
  RESIGNED = 'RESIGNED',
  PENDING = 'PENDING',
  TERMINATED = 'TERMINATED',
  IN_PROBATION = 'IN_PROBATION'
}

export enum StatusEnumInKh {
  ACTIVE = 'កំពុងធ្វើការ',
  RESIGNED = 'ការលាលែងពីតំណែង',
  PENDING = 'កំពុងរង់ចាំ',
  TERMINATED = 'ការបញ្ចប់ការងារ'
}

export enum EmployeeActiveStatusEnum {
  ACTIVE = EmployeeStatusEnum.ACTIVE,
  IN_PROBATION = EmployeeStatusEnum.IN_PROBATION
}

// employee status that support with leave type policy

export enum LeavePolicyEmployeeStatusEnum {
  ACTIVE = EmployeeStatusEnum.ACTIVE,
  IN_PROBATION = EmployeeStatusEnum.IN_PROBATION
}

// update probation employee enum

export enum UpdateProbationEmployeeStatusEnum {
  ACTIVE = 'ACTIVE',
  FAILED_PROBATION = 'FAILED_PROBATION'
}

export enum GenderStatusEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum EmploymentTypeEnum {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  INTERN = 'INTERN'
}

export enum EmploymentTypeEnumInKh {
  FULL_TIME = 'ពេញម៉ោង',
  PART_TIME = 'ក្រៅម៉ោង'
}
