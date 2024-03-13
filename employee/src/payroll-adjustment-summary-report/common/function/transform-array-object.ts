export const transformArrayToObject = (data: any[]): Record<string, number> => {
  return data.reduce((result, item) => {
    const name = item.benefitComponent?.name ?? item?.name;
    const amount = item.amount ?? 0;

    if (name) {
      result[name] = amount;
    }

    return result;
  }, {});
};
