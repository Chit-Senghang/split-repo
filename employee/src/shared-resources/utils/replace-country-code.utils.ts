export const replaceCountryCode = (phone: string) => {
  const cambodiaCountryCode = '855';
  if (phone.startsWith('0')) {
    phone = cambodiaCountryCode + phone.substring(1);
  }
  return phone;
};
