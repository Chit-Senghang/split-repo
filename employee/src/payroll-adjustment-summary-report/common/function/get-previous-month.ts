export const getPreviousDate = (currentDate: Date) => {
  const previousDate = currentDate;
  previousDate.setMonth(currentDate.getMonth() - 1);

  // adjust the year if the result is a negative month
  if (previousDate.getMonth() === 11) {
    previousDate.setFullYear(currentDate.getFullYear() - 1);
  }

  // format the result as 'YYYY-MM'
  const year = previousDate.getFullYear();
  const month = (previousDate.getMonth() + 1).toString().padStart(2, '0');
  // add 1 to month because it's 0-indexed

  return `${year}-${month}`;
};
