export const generateOtpCodeUtil = (length: number) => {
  const chars = '012456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
};
