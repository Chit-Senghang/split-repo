export const round = (n: number, round?: any) => {
  const roundNumber = Math.pow(10, Number(round) || 0);
  return Math.round(n * roundNumber) / roundNumber;
};
