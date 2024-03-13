export const customTrimNumber = (value: number) => {
  const convertToString = String(value);
  return Number(convertToString.replace(',', '.'));
};

export const customTrimString = (value: string) => {
  return value.trim();
};
