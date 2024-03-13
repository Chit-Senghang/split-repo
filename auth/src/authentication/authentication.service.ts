/* eslint-disable no-useless-catch */
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, QueryRunner, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { RpcException } from '@nestjs/microservices';
import { AllEmployeeConst } from '../constant/all-employee-const';
import { HttpStatusCodeMekong } from '../shared-resources/common/utils/http-status-code';
// import { EmployeeStatusEnum } from '../employee/src/employee/enum/employee-status.enum';
import { replaceCountryCode } from '../shared-resources/utils/replace-country-code.utils';
import {
  convertUtcToLocalTime,
  dayJs,
  getCurrentDate
} from '../shared-resources/common/utils/date-utils';
import { ResourceBadRequestException } from '../shared-resources/exception/badRequest.exception';
import { BaseCustomException } from '../shared-resources/abstract';
import { User } from '../user/entities/user.entity';
import {
  ResourceNotFoundException,
  UnauthorizedResourceException
} from '../shared-resources/exception/index';
import { Otp } from '../otp/entities/otp.entity';
import { OtpTransporter } from '../otp/common/ts/interface/otp-transporter';
import { MailService } from '../otp/mail.service';
import { TwilioService } from '../otp/twilio.service';
import { GrpcService } from '../grpc/grpc.service';
import { UserConsumer } from '../user/entities/user-consumer.entity';
import { EmployeeProto } from '../shared-resources/proto';
import { getCurrentUserFromContext } from '../shared-resources/utils/get-user-from-current-context.common';
import { CacheService } from '../cache/cache.service';
import { Role } from '../role/entities/role.entity';
import { UserRole } from '../user/entities/user-role.entity';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { ConstantConst } from '../constant/constant-const';
import { generateOtpCodeUtil } from '../shared-resources/common/utils/generate-code-otp-util';
import { GlobalConfiguration } from '../global-configuration/entities/global-configuration.entity';
import { GlobalConfigurationNameEnum } from '../shared-resources/common/enum/global-configuration-name.enum';
import { AccessAttempt } from '../global-configuration/entities/access-attempt.entity';
import { CreateAccessAttemptDto } from '../global-configuration/dto/create-access-attempt.dto';
import { AccessAttemptEnum } from '../global-configuration/common/ts/enums/access-attempt-type.enum';
import { DEFAULT_DATE_TIME_FORMAT } from '../shared-resources/common/dto/default-date-format';
import { essRole } from '../shared-resources/ts/constants/constants';
import { MekongService } from '../otp/mekong.services';
import { GlobalConfigurationService } from '../global-configuration/global-configuration.service';
import {
  VerifyOtpDto,
  ChangePasswordDto,
  LoginDto,
  GetOtpOptionDto,
  JwtPayload
} from './dto';
import { KongJwtService } from './kong-jwt.service';
import { SetPasswordOption } from './common/ts/enum/setpassword.enum';
import { CreateUserAccessToken } from './dto/access-token-firebase.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GetOtpMekongDto } from './dto/get-otp-mekong.dto';
import { IEmployeeMpathData } from './common/interfaces/employee-mpath.interface';

const passwordSalt = process.env.PASSWORD_SALT;
const restPasswordTokenTtl = process.env.REST_PASSWORD_TOKEN_TTL;
const otpTtl = Number(process.env.OTP_TTL);
const jwtAccessTokenExpire = process.env.JWT_ACCESS_TOKEN_EXPIRE;
const jwtRefreshTokenExpire = process.env.JWT_REFRESH_TOKEN_EXPIRE;

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly kongJwtService: KongJwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    @Inject(TwilioService)
    private readonly phoneOtpTransporterService: OtpTransporter,
    @Inject(MailService)
    private readonly mailOtpTransporterService: OtpTransporter,
    private readonly mekongService: MekongService,
    @Inject(GrpcService) private readonly grpcService: GrpcService,
    @Inject(CacheService) private readonly cacheService: CacheService,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    private readonly globalConfigurationService: GlobalConfigurationService
  ) {}

  private generateJwtToken(
    payload: JwtPayload,
    secret: string,
    expire: string
  ) {
    return this.jwtService.sign(payload, { secret, expiresIn: expire });
  }

  async grpcGenerateJwtToken(employeeId: number, userId: number) {
    try {
      const user: User = await this.userRepo.findOne({
        where: {
          id: userId
        },
        relations: {
          userConsumer: true,
          userRole: {
            role: {
              rolePermission: {
                permission: true
              }
            }
          }
        }
      });

      if (!user) {
        throw new RpcException({
          code: 5,
          message: `Resource of user ${userId} not found`
        });
      }

      const createCredentialRes =
        await this.kongJwtService.createConsumerCredential(
          user.userConsumer.consumerId
        );

      const accessToken = this.generateJwtToken(
        {
          phoneNumber: user.phone,
          employeeId: employeeId.toString(),
          iss: createCredentialRes.key,
          email: user.email
        },
        createCredentialRes.secret,
        jwtAccessTokenExpire
      );

      const refreshToken = this.generateJwtToken(
        {
          phoneNumber: user.phone,
          employeeId: String(user.id),
          iss: createCredentialRes.key,
          refreshToken: true,
          email: user.email
        },
        createCredentialRes.secret,
        jwtRefreshTokenExpire
      );
      await this.cacheService.setCurrentUser(user.id, user);
      return {
        accessToken: accessToken,
        refreshToken: refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  async getOtpMekong(dto: GetOtpMekongDto) {
    const testMode = Boolean(process.env.TEST_MODE);
    await this.grpcService.findOneByPhoneGrpc({
      phone: dto.phone
    });
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const { value: smsSender } =
        await this.globalConfigurationService.findOneByName(
          GlobalConfigurationNameEnum.SMS_SENDER
        );

      const { value: customData } =
        await this.globalConfigurationService.findOneByName(
          GlobalConfigurationNameEnum.SMS_CUSTOM_DATA
        );
      const code = generateOtpCodeUtil(6);
      const otpCreated = queryRunner.manager.create(Otp, {
        code,
        expireAt: getCurrentDate().add(otpTtl, 'minute'),
        phone: dto.phone
      });
      await queryRunner.manager.save(otpCreated);
      if (testMode) {
        await queryRunner.commitTransaction();
        return {
          data: {
            key: otpCreated.key,
            code: otpCreated.code
          }
        };
      } else {
        const mekongOtp = await this.mekongService.sendOtp(
          `Your ${customData} otp code is ${otpCreated.code} from KOT The ${smsSender}`,
          replaceCountryCode(dto.phone)
        );
        if (mekongOtp === HttpStatusCodeMekong.Ok) {
          await queryRunner.commitTransaction();
          return {
            data: {
              key: otpCreated.key
            }
          };
        } else if (mekongOtp === HttpStatusCodeMekong.AccountHasAPIAccess) {
          throw new ResourceForbiddenException('Account has no API access');
        } else if (mekongOtp === HttpStatusCodeMekong.AccountWasExpired) {
          throw new ResourceForbiddenException('Account was expired');
        } else if (
          mekongOtp === HttpStatusCodeMekong.InvalidPhoneNumberFormat
        ) {
          throw new ResourceForbiddenException('Invalid phone number format');
        }
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      queryRunner.release();
    }
  }

  async verify(verifyOtpDto: VerifyOtpDto, restPassword = false) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const otp = await queryRunner.manager.findOneBy(Otp, {
        key: verifyOtpDto.key
      });

      const kongHost = process.env.KONG_URI || 'http://localhost:8001';
      if (!otp) {
        throw new ResourceBadRequestException('otp', 'not exist');
      }

      if (otp.isVerified) {
        throw new ResourceForbiddenException(
          'otp code',
          'This otp code is already used.'
        );
      }

      if (getCurrentDate().toDate() > convertUtcToLocalTime(otp.expireAt)) {
        throw new ResourceBadRequestException('token', `token already expired`);
      }

      if (otp.code !== verifyOtpDto.code) {
        throw new ResourceBadRequestException('code', `code is invalid`);
      }

      let user: User;
      let employee: EmployeeProto.EmployeeDto;
      let resetPasswordToken: string;

      if (restPassword) {
        user = await this.userRepo.findOne({
          where: [{ email: verifyOtpDto.email }, { phone: verifyOtpDto.phone }],
          relations: {
            userConsumer: true,
            userRole: {
              role: {
                rolePermission: {
                  permission: true
                }
              }
            }
          }
        });

        if (!user) {
          throw new ResourceNotFoundException(
            'User',
            `user with ${verifyOtpDto.email ?? verifyOtpDto.phone}`
          );
        }

        const createCredentialRes =
          await this.kongJwtService.createConsumerCredential(
            user.userConsumer.consumerId
          );

        otp.expireAt = getCurrentDate().toDate();
        await queryRunner.manager.save(otp);

        if (otp.email || otp.phone) {
          resetPasswordToken = this.generateJwtToken(
            {
              phoneNumber: user.phone,
              employeeId: String(user.id),
              iss: createCredentialRes.key,
              email: user.email || otp.email,
              setPasswordOption: otp.email
                ? SetPasswordOption.EMAIL
                : SetPasswordOption.PHONE
            },
            createCredentialRes.secret,
            restPasswordTokenTtl
          );
        }
        return { data: { token: resetPasswordToken } };
      }

      const role = await this.roleRepo.findOne({ where: { name: 'User' } });

      if (!role) {
        throw new ResourceNotFoundException('Role', 'User');
      }

      if (verifyOtpDto.phone) {
        if (otp.email) {
          throw new ResourceBadRequestException(
            'email',
            'require phone but received email'
          );
        }
        if (verifyOtpDto.phone !== otp.phone) {
          throw new ResourceBadRequestException(
            'phone',
            "phone number doesn't match with otp"
          );
        }
        employee = await this.grpcService.findOneByPhoneGrpc(verifyOtpDto);
        if (!employee) {
          throw new ResourceNotFoundException('Employee');
        }

        const salt = await bcrypt.genSaltSync(Number(passwordSalt));
        user = this.userRepo.create({
          username: employee.firstNameEn,
          password: await bcrypt.hash(verifyOtpDto.password, salt),
          email: employee.email,
          phone: employee.phone,
          phoneVerified: true,
          resetPassword: false,
          isSelfService: true
        });
      } else if (verifyOtpDto.email) {
        if (otp.phone) {
          throw new ResourceBadRequestException(
            'phone',
            'require email but received phone'
          );
        }
        if (verifyOtpDto.email !== otp.email) {
          throw new ResourceBadRequestException(
            'email',
            "email doesn't match with otp"
          );
        }
        employee = await this.grpcService.findOneByEmailGrpc({
          email: verifyOtpDto.email
        });
        if (!employee) {
          throw new ResourceNotFoundException('Employee');
        }
        const salt = await bcrypt.genSaltSync(Number(passwordSalt));
        user = this.userRepo.create({
          username: employee.firstNameEn,
          password: await bcrypt.hash(verifyOtpDto.password, salt),
          email: employee.email,
          phone: employee.phone,
          emailVerified: true,
          resetPassword: false,
          isSelfService: true
        });
      } else {
        throw new ResourceBadRequestException(
          'phone or email',
          'should not be empty'
        );
      }
      const userData = await queryRunner.manager.save(user);
      const updateOtp: Otp = Object.assign(otp, {
        ...otp,
        isVerified: true
      });
      await queryRunner.manager.save(updateOtp);
      const roleData = queryRunner.manager.create(UserRole, {
        user: userData,
        role
      });
      await queryRunner.manager.save(roleData);
      const employeeUpdate = {
        phone: userData.phone,
        email: userData.email,
        userId: userData.id
      };

      try {
        const resp = await axios.post(`${kongHost}/consumers/`, {
          username: userData.username,
          // eslint-disable-next-line camelcase
          custom_id: String(userData.id)
        });
        const createConsumer = queryRunner.manager.create(UserConsumer, {
          consumerId: resp.data.id,
          user: { id: Number(resp.data.custom_id) }
        });

        await queryRunner.manager.save(createConsumer);

        const createCredentialRes =
          await this.kongJwtService.createConsumerCredential(resp.data.id);
        await this.grpcService.updateEmployeeGrpc(employeeUpdate);

        otp.expireAt = getCurrentDate().toDate();
        await queryRunner.manager.save(otp);

        if (otp.email) {
          resetPasswordToken = this.generateJwtToken(
            {
              phoneNumber: user.phone,
              employeeId: String(user.id),
              iss: createCredentialRes.key,
              email: user.email || otp.email,
              setPasswordOption: SetPasswordOption.EMAIL
            },
            createCredentialRes.secret,
            restPasswordTokenTtl
          );
        } else {
          resetPasswordToken = this.generateJwtToken(
            {
              phoneNumber: user.phone,
              employeeId: String(user.id),
              iss: createCredentialRes.key,
              email: otp.email,
              setPasswordOption: SetPasswordOption.PHONE
            },
            createCredentialRes.secret,
            restPasswordTokenTtl
          );
          return { data: { token: resetPasswordToken } };
        }
      } catch (e) {
        throw new ResourceBadRequestException(
          e.message,
          `${userData.username} already existed`
        );
      }
      await queryRunner.commitTransaction();
      return { data: { token: resetPasswordToken } };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createNewUserAccountActive(dto: CreateUserAccessToken) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const employee: EmployeeProto.EmployeeDto =
        await this.grpcService.findOneByPhoneGrpc(dto);
      if (!employee) {
        throw new ResourceNotFoundException(AllEmployeeConst.EMPLOYEE);
      }
      const otp = await queryRunner.manager.findOneBy(Otp, {
        phone: dto.phone,
        key: dto.key,
        code: dto.code
      });
      if (!otp) {
        throw new ResourceNotFoundException('opt', "opt doesn't exist");
      }

      if (getCurrentDate().toDate() > convertUtcToLocalTime(otp.expireAt)) {
        throw new ResourceBadRequestException('otp', `otp already expired`);
      }

      const salt = await bcrypt.genSaltSync(Number(passwordSalt));
      const user = queryRunner.manager.create(User, {
        username: employee.phone,
        password: await bcrypt.hash(dto.password, salt),
        email: dto.email ? dto.email : employee.email,
        phone: employee.phone,
        phoneVerified: true,
        emailVerified: true,
        resetPassword: false,
        isSelfService: true
      });
      const role = await queryRunner.manager.findOne(Role, {
        where: { name: essRole.name }
      });

      if (!role) {
        throw new ResourceNotFoundException(
          AllEmployeeConst.ROLE,
          essRole.name
        );
      }
      const userData = await queryRunner.manager.save(user);
      const roleData = queryRunner.manager.create(UserRole, {
        user: userData,
        role
      });

      await queryRunner.manager.save(roleData);
      const employeeUpdate = {
        phone: userData.phone,
        email: userData.email,
        userId: userData.id
      };
      const resetPasswordToken = await this.createConsumer(
        queryRunner,
        userData,
        otp,
        employeeUpdate
      );

      await queryRunner.commitTransaction();
      return { data: { token: resetPasswordToken } };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    const otp = await this.dataSource.getRepository(Otp).findOneBy({
      phone: dto.phone,
      key: dto.key,
      code: dto.code
    });
    if (!otp) {
      throw new ResourceBadRequestException('opt', 'opt is invalid');
    } else if (dto.phone !== otp.phone) {
      throw new ResourceBadRequestException(
        'phone',
        "phone number doesn't match with otp"
      );
    }

    if (getCurrentDate().toDate() > convertUtcToLocalTime(otp.expireAt)) {
      throw new ResourceBadRequestException('token', `token already expired`);
    }

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const user = await queryRunner.manager.findOne(User, {
        where: {
          phone: dto.phone
        },
        relations: {
          userConsumer: true,
          userRole: {
            role: {
              rolePermission: {
                permission: true
              }
            }
          }
        }
      });
      if (!user) {
        throw new ResourceNotFoundException(
          `${dto.phone} is not found in our system`
        );
      }
      const salt = await bcrypt.genSaltSync(Number(passwordSalt));
      user.password = await bcrypt.hash(dto.password, salt);
      user.resetPassword = false;
      await queryRunner.manager.save(user);
      await this.cacheService.setUserAudit(user.id, user);
      await queryRunner.commitTransaction();
      return {
        data: user.id
      };
    } catch (error) {
      await queryRunner.release();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async setSelfNewPassword(newPassword: string, token: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    const payload = this.jwtService.decode(token) as JwtPayload;
    const userId = getCurrentUserFromContext();

    if (!payload.setPasswordOption) {
      throw new UnauthorizedResourceException();
    }
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId }
      });
      if (!user) {
        throw new ResourceNotFoundException('user');
      }
      const salt = await bcrypt.genSaltSync(Number(passwordSalt));
      user.password = await bcrypt.hash(newPassword, salt);
      await queryRunner.manager.save(user);
      await this.kongJwtService.deleteJwtCredentialById(
        String(payload.credentialId)
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getOtpForVerify(getOtpOptionDto: GetOtpOptionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const otp = this.generateOtp(6);
      const otpCreated = queryRunner.manager.create(Otp, {
        code: otp,
        expireAt: getCurrentDate().add(otpTtl, 'minute')
      });

      if (getOtpOptionDto.email) {
        otpCreated.email = getOtpOptionDto.email;
      } else if (getOtpOptionDto.phone) {
        otpCreated.phone = getOtpOptionDto.phone;
        await this.phoneOtpTransporterService.sendOtp(otp, otpCreated.phone);
      }

      await queryRunner.manager.save(otpCreated);

      await queryRunner.commitTransaction();

      return {
        data: {
          key: otpCreated.key,
          code: otp
        }
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getOtp(getOtpOptionDto: GetOtpOptionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const otp = this.generateOtp(6);
      const otpCreated = queryRunner.manager.create(Otp, {
        code: otp,
        expireAt: getCurrentDate().add(otpTtl, 'minute')
      });
      const otpTemplate = `<h1 style="font-size: 16">Here is your OTP!</h1> <br>${otp}`;

      if (getOtpOptionDto.email) {
        otpCreated.email = getOtpOptionDto.email;
        await this.mailOtpTransporterService.sendOtp(
          otpTemplate,
          otpCreated.email
        );
      }
      if (getOtpOptionDto.phone) {
        otpCreated.phone = getOtpOptionDto.phone;
        await this.phoneOtpTransporterService.sendOtp(otp, otpCreated.phone);
      }

      await queryRunner.manager.save(otpCreated);

      await queryRunner.commitTransaction();

      return {
        data: {
          key: otpCreated.key,
          code: otp
        }
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  generateOtp(length: number) {
    const chars = '012456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }

    return token;
  }

  async logout(credentialId: string) {
    const userId = getCurrentUserFromContext();
    await this.cacheService.deleteUserKey(userId);
    await this.cacheService.deleteUserMpath(userId);
    return this.kongJwtService.deleteJwtCredentialById(credentialId);
  }

  async generateNewTokenByRefreshToken(
    credentialId: string,
    phoneNumber: string,
    userId: string,
    token: string
  ) {
    const jwtCredential =
      await this.kongJwtService.getJwtCredentialById(credentialId);

    const jwtPayload = this.jwtService.decode(token) as JwtPayload;

    if (!jwtPayload.refreshToken) {
      throw new UnauthorizedResourceException();
    }

    const accessToken = this.generateJwtToken(
      {
        phoneNumber: phoneNumber,
        employeeId: userId,
        iss: credentialId,
        email: jwtPayload.email,
        setPasswordOption: SetPasswordOption.EMAIL,
        credentialId: jwtPayload.credentialId
      },
      jwtCredential.secret,
      jwtAccessTokenExpire
    );
    const refreshToken = this.generateJwtToken(
      {
        phoneNumber: phoneNumber,
        employeeId: userId,
        iss: credentialId,
        refreshToken: true,
        email: jwtPayload.email,
        setPasswordOption: SetPasswordOption.EMAIL,
        credentialId: jwtPayload.credentialId
      },
      jwtCredential.secret,
      jwtRefreshTokenExpire
    );
    const userMpath = await this.cacheService.getUserMpath(Number(userId));
    if (!userMpath) {
      await this.setEmployeeMpath(Number(userId));
    }
    return {
      accessToken,
      refreshToken
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const userId = getCurrentUserFromContext();
    const user = await this.userRepo.findOne({
      where: {
        id: Number(userId)
      }
    });

    if (!user) {
      throw new UnauthorizedResourceException();
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password
    );

    if (!isMatch) {
      throw new ResourceBadRequestException('Password', 'Invalid old password');
    }
    const salt = await bcrypt.genSaltSync(Number(passwordSalt));
    user.password = await bcrypt.hash(changePasswordDto.newPassword, salt);
    user.resetPassword = false;
    await this.userRepo.save(user);
    await this.cacheService.setUserAudit(user.id, user);
    return {
      userId: user.id
    };
  }

  async login(loginDto: LoginDto, headers: any) {
    try {
      const user: User = await this.userRepo.findOne({
        where: [
          {
            isActive: true,
            email: loginDto.username,
            emailVerified: true
          },
          {
            isActive: true,
            phone: loginDto.username,
            phoneVerified: true
          }
        ],
        relations: {
          userConsumer: true,
          userRole: {
            role: {
              rolePermission: {
                permission: true
              }
            }
          }
        }
      });

      if (!user) {
        throw new UnauthorizedResourceException(
          `Username or password is invalid`
        );
      }
      const isMatch = await bcrypt.compare(loginDto.password, user.password);

      if (!isMatch) {
        const { failedLoginAttempts, limitAttempt, attemptLockDuration } =
          await this.checkAccessAttempt(user.id);

        if (failedLoginAttempts.length < Number(limitAttempt.value)) {
          //insert access attempt
          const payload: CreateAccessAttemptDto = {
            userId: user.id,
            ipAddress: headers['x-real-ip'],
            deviceDetail: headers['user-agent'],
            isSuccess: false,
            type: AccessAttemptEnum.LOGIN
          };
          await this.createAccessAttempt(payload);
        }

        //count wrong attempt
        this.checkFailedAttempt(
          failedLoginAttempts,
          limitAttempt,
          attemptLockDuration
        );

        throw new UnauthorizedResourceException(
          `Username or password is invalid`
        );
      } else {
        const currentEmployee = await this.grpcService.getEmployeeOfCurrentUser(
          user.id
        );

        if (!currentEmployee.status && user.isSelfService) {
          throw new ResourceBadRequestException(
            'user',
            'User requires one employee.'
          );
        }

        // check ESS employee status
        if (
          user.isSelfService &&
          !(
            currentEmployee?.status === 'ACTIVE' ||
            currentEmployee?.status === 'IN_PROBATION'
          )
        ) {
          throw new UnauthorizedResourceException(
            `Username or password is invalid`
          );
        }
      }

      const createCredentialRes =
        await this.kongJwtService.createConsumerCredential(
          user.userConsumer.consumerId
        );
      const accessToken = this.generateJwtToken(
        {
          phoneNumber: user.phone,
          employeeId: String(user.id),
          iss: createCredentialRes.key,
          email: user.email,
          setPasswordOption: SetPasswordOption.EMAIL,
          credentialId: createCredentialRes.id
        },
        createCredentialRes.secret,
        jwtAccessTokenExpire
      );

      const refreshToken = this.generateJwtToken(
        {
          phoneNumber: user.phone,
          employeeId: String(user.id),
          iss: createCredentialRes.key,
          refreshToken: true,
          email: user.email,
          setPasswordOption: SetPasswordOption.EMAIL,
          credentialId: createCredentialRes.id
        },
        createCredentialRes.secret,
        jwtRefreshTokenExpire
      );
      await this.cacheService.setCurrentUser(user.id, user);

      await this.setEmployeeMpath(user.id);
      await this.checkAccessAttempt(user.id);

      //insert access attempt
      const payload: CreateAccessAttemptDto = {
        userId: user.id,
        ipAddress: headers['x-real-ip'],
        deviceDetail: headers['user-agent'],
        isSuccess: true,
        type: AccessAttemptEnum.LOGIN
      };
      await this.createAccessAttempt(payload);
      return {
        accessToken: accessToken,
        refreshToken: refreshToken
      };
    } catch (error) {
      if (error instanceof BaseCustomException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async setEmployeeMpath(userId: number) {
    const employeeMpath = await this.grpcService.getAllEmployeeMpath();
    const user = await this.userRepo.findOneBy({ id: userId });
    if (user.isSelfService) {
      const currentEmployee = await this.grpcService.getEmployeeOfCurrentUser(
        user.id
      );

      // Creating a new user, user does not has employee yet.
      if (!currentEmployee?.id) {
        return;
      }

      if (employeeMpath.data.length) {
        const employeeUnderPosition: number[] = [currentEmployee.id];

        currentEmployee.mpath.forEach((mpath: string) => {
          const employeeIds = this.handleMpath(mpath, employeeMpath.data);
          if (employeeIds.length) {
            employeeUnderPosition.push(...employeeIds);
          }
        });

        const uniqueEmployeeIds: number[] = [...new Set(employeeUnderPosition)];

        await this.cacheService.setUserMpath(user.id, uniqueEmployeeIds);
      }
    } else {
      if (employeeMpath?.data?.length) {
        const employeeIds = employeeMpath.data.map(
          (employee: IEmployeeMpathData) => employee.id
        );
        await this.cacheService.setUserMpath(user.id, employeeIds);
      }
    }
  }

  handleMpath(userMpath: string, employees: IEmployeeMpathData[]) {
    const {
      structureTeam: currentUserTeam,
      positionLevelNumber: positionLevelNumber,
      mpath: currentUserMpath
    } = this.separateMpathIntoPattern(userMpath);

    const employeeIds: number[] = [];
    employees.forEach((employee: IEmployeeMpathData) => {
      employee.mpath.forEach((mpath: string) => {
        const {
          mpath: employeeMpath,
          structureTeam: employeeTeam,
          positionLevelNumber: employeePositionLevelNumber
        } = this.separateMpathIntoPattern(mpath);

        // CASE: structure from company till department is different
        if (currentUserMpath !== employeeMpath) {
          return;
        }

        //CASE: check nested team level
        const { isValid: isSameTeam, checkPosition: checkPosition } =
          this.compareCompanyStructureTeam(currentUserTeam, employeeTeam);

        if (isSameTeam) {
          //CASE: check position level number
          if (!checkPosition) {
            employeeIds.push(employee.id);
          } else {
            const isAllowedPosition = this.comparePositionLevelNumber(
              positionLevelNumber,
              employeePositionLevelNumber
            );

            if (isAllowedPosition) {
              employeeIds.push(employee.id);
            }
          }
        }
      });
    });

    return employeeIds;
  }

  async createConsumer(
    queryRunner: QueryRunner,
    user: User,
    otp: Otp,
    employeeUpdate: any
  ) {
    try {
      let resetPasswordToken: string;
      const resp = await axios.post(`${ConstantConst.kongHost}/consumers/`, {
        username: user.username,
        // eslint-disable-next-line camelcase
        custom_id: String(user.id)
      });
      const createConsumer = queryRunner.manager.create(UserConsumer, {
        consumerId: resp.data.id,
        user: { id: Number(resp.data.custom_id) }
      });
      await queryRunner.manager.save(createConsumer);

      const createCredentialRes =
        await this.kongJwtService.createConsumerCredential(resp.data.id);
      otp.expireAt = getCurrentDate().toDate();
      await queryRunner.manager.save(otp);
      await this.grpcService.updateEmployeeGrpc(employeeUpdate);

      if (otp.email || otp.phone) {
        resetPasswordToken = this.generateJwtToken(
          {
            phoneNumber: user.phone,
            employeeId: String(user.id),
            iss: createCredentialRes.key,
            email: user.email || otp.email,
            setPasswordOption: otp.email
              ? SetPasswordOption.EMAIL
              : SetPasswordOption.PHONE
          },
          createCredentialRes.secret,
          ConstantConst.restPasswordTokenTtl
        );
      }
      return resetPasswordToken;
    } catch (e) {
      throw new ResourceBadRequestException(
        e.message,
        `${user.username} already existed`
      );
    }
  }

  async getGlobalConfigurationByName(
    name: string
  ): Promise<GlobalConfiguration> {
    return await this.dataSource.getRepository(GlobalConfiguration).findOne({
      where: { name }
    });
  }

  async getConfigurationOfAccessAttempt() {
    const limitAttempt: GlobalConfiguration =
      await this.getGlobalConfigurationByName(
        GlobalConfigurationNameEnum.ACCESS_ATTEMPT_LIMIT
      );

    const attemptLockDuration: GlobalConfiguration =
      await this.getGlobalConfigurationByName(
        GlobalConfigurationNameEnum.ACCESS_ATTEMPT_LOCKOUT_DURATION
      );

    const attemptDuration: GlobalConfiguration =
      await this.getGlobalConfigurationByName(
        GlobalConfigurationNameEnum.ACCESS_ATTEMPT_DURATION
      );

    return { limitAttempt, attemptLockDuration, attemptDuration };
  }

  async checkAccessAttempt(userId: number) {
    const { limitAttempt, attemptLockDuration, attemptDuration } =
      await this.getConfigurationOfAccessAttempt();

    const lastSuccessLogin: AccessAttempt = await this.getAccessAttempt(userId);

    let failedLoginAttempts: any;
    if (!lastSuccessLogin) {
      failedLoginAttempts = await this.getFailedAttemptsLogin(userId);
    } else {
      const { fromDate, toDate } = this.convertDateRange(
        lastSuccessLogin,
        attemptDuration
      );
      failedLoginAttempts = await this.getFailedAttemptsLogin(
        userId,
        fromDate,
        toDate
      );
    }

    return { failedLoginAttempts, limitAttempt, attemptLockDuration };
  }

  checkFailedAttempt(
    failedLoginAttempts: AccessAttempt[],
    limitAttempt: GlobalConfiguration,
    attemptLockDuration: GlobalConfiguration
  ) {
    if (failedLoginAttempts.length >= Number(limitAttempt.value)) {
      const firstFailedAttempt = failedLoginAttempts.sort(
        (a: any, b: any) => a.id - b.id
      );
      const currentDateTime = dayJs()
        .utc(true)
        .format(DEFAULT_DATE_TIME_FORMAT);

      const lastFailedAttemptDateTime = dayJs(firstFailedAttempt[0].createdAt)
        .utc(true)
        .add(Number(attemptLockDuration.value) / 3600, 'hour')
        .format(DEFAULT_DATE_TIME_FORMAT);

      this.checkDurationLockTime(lastFailedAttemptDateTime, currentDateTime);
    }
  }

  async getAccessAttempt(
    userId: number,
    isLastSuccess = true
  ): Promise<AccessAttempt> {
    return await this.dataSource.getRepository(AccessAttempt).findOne({
      where: {
        user: { id: userId },
        isSuccess: isLastSuccess ?? false
      },
      order: { id: isLastSuccess ? 'DESC' : 'ASC' }
    });
  }

  convertDateRange(
    lastSuccessLogin: AccessAttempt,
    attemptDuration: GlobalConfiguration
  ) {
    const fromDate: any = dayJs(lastSuccessLogin.createdAt)
      .utc(true)
      .format(DEFAULT_DATE_TIME_FORMAT);

    const toDate: any = dayJs(lastSuccessLogin.createdAt)
      .utc(true)
      .add(Number(attemptDuration.value), 'hour')
      .format(DEFAULT_DATE_TIME_FORMAT);
    return { fromDate, toDate };
  }

  async createAccessAttempt(createAccessAttemptDto: CreateAccessAttemptDto) {
    try {
      const accessAttempt: AccessAttempt = this.dataSource
        .getRepository(AccessAttempt)
        .create({
          ...createAccessAttemptDto,
          user: { id: createAccessAttemptDto.userId }
        });

      await this.dataSource.manager.save(accessAttempt);
    } catch (error) {
      Logger.log(error);
    }
  }

  async getFailedAttemptsLogin(userId: number, fromDate?: any, toDate?: any) {
    return await this.dataSource.getRepository(AccessAttempt).find({
      where: {
        user: { id: userId },
        isSuccess: false,
        createdAt: fromDate && toDate ? Between(fromDate, toDate) : null
      }
    });
  }

  checkDurationLockTime(
    lastSuccessLoginTime: Date | string,
    currentDateTime: string
  ) {
    const isLocked = dayJs(currentDateTime).isBefore(lastSuccessLoginTime);
    if (isLocked) {
      const lockDurationLeft = dayJs(lastSuccessLoginTime).diff(
        currentDateTime,
        'second'
      );

      throw new ResourceForbiddenException(
        `Your account has been locked. Please try again after ${Math.round(
          lockDurationLeft / 60
        )} minutes(s).`
      );
    }
  }

  // ====================== [Private block] ======================
  private separateMpathIntoPattern(mpath: string) {
    const structures = mpath.split('L');
    return {
      mpath: structures.at(0).split('.').splice(0, 4).join('.'), //get structure from company till department
      positionLevelNumber: structures.at(1), //get position level number,
      structureTeam: structures[0]
        .split('.')
        .slice(4, structures[0].split('.').length - 1) // get structure from team,
    };
  }

  private compareCompanyStructureTeam(
    teamIds: string[] | number[],
    employeeTeamIds: string[] | number[]
  ) {
    const teamLength = teamIds.length - 1;
    let checkPositionLevel = true;
    for (let index = 0; index <= teamLength; index++) {
      if (teamIds[index] !== employeeTeamIds[index]) {
        return { isValid: false, checkPosition: false };
      } else if (!employeeTeamIds[index]) {
        checkPositionLevel = false;
      }
    }
    return { isValid: true, checkPosition: checkPositionLevel };
  }

  private comparePositionLevelNumber(
    currentUserPositionLevelNumber: string,
    employeePositionLevelNumber: string
  ): boolean {
    if (currentUserPositionLevelNumber > employeePositionLevelNumber) {
      return true;
    }
  }
}
