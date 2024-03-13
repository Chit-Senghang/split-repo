import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { Employee } from '../entity/employee.entity';

export const EMPLOYEE_SELECTED_FIELDS_FOR_UPDATE_AND_CREATE = {
  contacts: {
    id: true,
    isDefault: true,
    contact: true
  },
  emergencyContacts: {
    id: true,
    contact: true,
    contactRelationship: {
      id: true
    }
  },
  positions: {
    id: true,
    isDefaultPosition: true,
    companyStructurePosition: {
      id: true
    }
  },
  identifiers: {
    id: true,
    documentIdentifier: true,
    expireDate: true,
    description: true,
    documentTypeId: {
      id: true
    }
  },
  paymentMethodAccounts: {
    id: true,
    isDefaultAccount: true,
    accountNumber: true,
    paymentMethod: {
      id: true
    }
  },
  insuranceCards: {
    id: true,
    cardNumber: true,
    insuranceId: {
      id: true
    }
  },
  vaccinationCards: {
    id: true,
    cardNumber: true,
    vaccinationId: {
      id: true
    }
  },
  educations: {
    id: true,
    instituteName: true,
    major: true,
    startDate: true,
    endDate: true,
    educationTypeId: {
      id: true
    }
  },
  languages: {
    id: true
  },
  trainings: {
    id: true
  },
  skills: {
    id: true
  },
  addressCommuneId: {
    id: true
  },
  addressVillageId: {
    id: true
  },
  addressDistrictId: {
    id: true
  },
  addressProvinceId: {
    id: true
  }
} as FindOptionsSelect<Employee>;

export const EMPLOYEE_RELATIONSHIP_FOR_CREATE_AND_UPDATE = {
  contacts: true,
  emergencyContacts: { contactRelationship: true },
  positions: { companyStructurePosition: true },
  identifiers: { documentTypeId: true },
  paymentMethodAccounts: { paymentMethod: true },
  insuranceCards: { insuranceId: true },
  vaccinationCards: { vaccinationId: true },
  educations: { educationTypeId: true },
  languages: true,
  trainings: true,
  skills: true,
  gender: true,
  nationality: true,
  placeOfBirthId: true,
  workingShiftId: true,
  addressCommuneId: true,
  addressVillageId: true,
  addressDistrictId: true,
  addressProvinceId: true
} as FindOptionsRelations<Employee>;
