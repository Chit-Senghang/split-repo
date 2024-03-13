export function removeUnnecessaryProps(obj: any) {
  delete obj.version;
  delete obj.type;
  delete obj.deletedAt;
}
