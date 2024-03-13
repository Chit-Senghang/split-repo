export function removeUnnecessaryProps(obj: any) {
  delete obj.createdBy;
  delete obj.updatedAt;
  delete obj.version;
  delete obj.createdAt;
  delete obj.createdAt;
  delete obj.createdAt;
  delete obj.updatedBy;
  delete obj.deletedAt;
}

export function removeUnnecessaryCompanyStructureProps(obj: any) {
  delete obj.createdBy;
  delete obj.updatedAt;
  delete obj.version;
  delete obj.createdAt;
  delete obj.type;
  delete obj.createdAt;
  delete obj.createdAt;
  delete obj.updatedBy;
  delete obj.deletedAt;
  delete obj.companyStructureCompany;
}
