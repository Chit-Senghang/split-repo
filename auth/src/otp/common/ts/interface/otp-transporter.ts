export interface OtpTransporter {
  sendOtp(otp: string, to: string): Promise<void>;
}
