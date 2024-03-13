export enum HttpStatusCodeMekong {
  Ok = 0,
  InvalidUserOrPassword = 101,
  InvalidPhoneNumberFormat = 103,
  MissingOrInvalidParameter = 102,
  MissingOrInvalidDestinationAddress = 104,
  MissingSMSText = 105,
  NotEnoughCreditsInUserAccount = 106,
  NetworkProblem = 108,
  AccountHasAPIAccess = 109,
  AccountWasExpired = 110,
  AccessDeniesSenderID = 111,
  GeneralSystemError = 999
}
