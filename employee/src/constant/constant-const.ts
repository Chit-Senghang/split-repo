export class ConstantConst {
  static readonly kongHost = process.env.KONG_URI || 'http://localhost:8001';

  static readonly passwordSalt = process.env.PASSWORD_SALT;

  static readonly restPasswordTokenTtl = process.env.REST_PASSWORD_TOKEN_TTL;

  static readonly otpTtl = Number(process.env.OTP_TTL);

  static readonly jwtAccessTokenExpire = process.env.JWT_ACCESS_TOKEN_EXPIRE;

  static readonly jwtRefreshTokenExpire = process.env.JWT_REFRESH_TOKEN_EXPIRE;
}
