import { BadRequestException, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as cryptojs from 'cryptojs';
import { AllEmployeeConst } from '../constant/all-employee-const';
import { ResourceNotFoundException } from '../shared-resources/exception/resource-not-found.exception';
import { AuthenticationProto } from '../shared-resources/proto';
import { PaginationResponse } from '../shared-resources/ts/interface/response.interface';
import { GetPagination } from '../shared-resources/utils/pagination-query.common';
import { ResourceForbiddenException } from '../shared-resources/exception/forbidden.exception';
import { GlobalConfigurationNameEnum } from '../shared-resources/common/enum/global-configuration-name.enum';
import { globalConfigurationConstraint } from '../shared-resources/ts/constants/resource-exception-constraints';
import { handleResourceConflictException } from '../shared-resources/common/utils/handle-resource-conflict-exception';
import { PaginationQueryGlobalConfigurationDto } from './dto/pagination-global-configuration.dto';
import { UpdateGlobalConfigurationDto } from './dto/update-global-configuration.dto';
import {
  GlobalConfiguration,
  globalConfigurationSearchableColumns
} from './entities/global-configuration.entity';
import { GLOBAL_CONFIGURATION_DATATYPE } from './common/ts/enums/global-configuration-datatype.enum';

@Injectable()
export class GlobalConfigurationService {
  private readonly ERROR_MESSAGE_ON_MODIFY_SYSTEM_DEFINED_CONFIG =
    'This configuration is defined by system, cannot be changed.';

  constructor(
    @InjectRepository(GlobalConfiguration)
    private readonly globalConfigurationRepo: Repository<GlobalConfiguration>
  ) {}

  async findAll(
    pagination: PaginationQueryGlobalConfigurationDto
  ): Promise<PaginationResponse<GlobalConfiguration>> {
    return GetPagination(
      this.globalConfigurationRepo,
      pagination,
      globalConfigurationSearchableColumns,
      {
        where: {
          type: pagination.type === 'GENERAL' ? IsNull() : pagination.type,
          isEnable: pagination.isEnable,
          isSystemDefined: pagination.isSystemDefined
        },
        mapFunction: (globalConfiguration: GlobalConfiguration) => {
          return this.removePasswordResponse(globalConfiguration);
        }
      }
    );
  }

  private removePasswordResponse(globalConfiguration: GlobalConfiguration) {
    if (
      globalConfiguration.dataType === GLOBAL_CONFIGURATION_DATATYPE.PASSWORD
    ) {
      globalConfiguration.value = null;
    }
    return globalConfiguration;
  }

  async findGlobalConfigById(id: number): Promise<GlobalConfiguration> {
    const globalConfiguration = await this.globalConfigurationRepo.findOneBy({
      id
    });
    if (!globalConfiguration) {
      throw new ResourceNotFoundException(
        AllEmployeeConst.GLOBAL_CONFIGURATION,
        id
      );
    }

    return this.removePasswordResponse(globalConfiguration);
  }

  async findOneByName(name: string): Promise<GlobalConfiguration> {
    const globalConfiguration = await this.globalConfigurationRepo.findOne({
      where: { name }
    });
    if (!globalConfiguration) {
      throw new ResourceNotFoundException(
        AllEmployeeConst.GLOBAL_CONFIGURATION,
        name
      );
    }
    return globalConfiguration;
  }

  async update(
    id: number,
    updateGlobalConfigurationDto: Partial<UpdateGlobalConfigurationDto>
  ) {
    const globalConfiguration = await this.findGlobalConfigById(id);

    const regex = new RegExp(globalConfiguration.regex);

    if (
      globalConfiguration.regex &&
      !regex.test(updateGlobalConfigurationDto.value)
    ) {
      throw new BadRequestException(globalConfiguration.message);
    }

    try {
      if (globalConfiguration.isSystemDefined) {
        throw new BadRequestException(
          this.ERROR_MESSAGE_ON_MODIFY_SYSTEM_DEFINED_CONFIG
        );
      }

      if (
        updateGlobalConfigurationDto.value &&
        globalConfiguration.dataType === GLOBAL_CONFIGURATION_DATATYPE.PASSWORD
      ) {
        updateGlobalConfigurationDto.value = cryptojs.Crypto.DES.encrypt(
          updateGlobalConfigurationDto.value,
          globalConfiguration.name
        );
      } else if (
        globalConfiguration.dataType === GLOBAL_CONFIGURATION_DATATYPE.BOOLEAN
      ) {
        updateGlobalConfigurationDto.value = undefined;
      }

      return await this.globalConfigurationRepo.save(
        Object.assign(globalConfiguration, updateGlobalConfigurationDto)
      );
    } catch (exception) {
      handleResourceConflictException(exception, globalConfigurationConstraint);
    }
  }

  async grpcGlobalConfiguration(
    configuration: AuthenticationProto.globalConfigurationName
  ) {
    const globalConfiguration = await this.globalConfigurationRepo.findOne({
      where: { name: configuration.name }
    });
    if (!globalConfiguration) {
      throw new RpcException({
        message: `Reason global configuration of ${configuration.name} not found`,
        code: 5
      });
    }
    return globalConfiguration;
  }

  async getAllType() {
    const allDate = [];
    const query = await this.globalConfigurationRepo.query(`
      SELECT distinct "type" FROM global_configuration where "type" is not null;
    `);
    if (query) {
      for (const data of query) {
        allDate.push(data.type);
      }
    }
    return allDate;
  }

  async checkAccessAttemptLockDuration(
    globalConfigurationName: string,
    accessLockDuration: string
  ): Promise<void> {
    if (!globalConfigurationName || !accessLockDuration) {
      return;
    }

    const hasTheSameName: boolean =
      globalConfigurationName ===
      GlobalConfigurationNameEnum.ACCESS_ATTEMPT_LOCKOUT_DURATION;
    if (hasTheSameName && accessLockDuration) {
      const globalConfiguration = await this.globalConfigurationRepo.findOne({
        where: { name: GlobalConfigurationNameEnum.ACCESS_ATTEMPT_DURATION }
      });

      const hasLongerLockDuration: boolean =
        Number(globalConfiguration.value) < Number(accessLockDuration);

      if (hasLongerLockDuration) {
        throw new ResourceForbiddenException(
          'Lock duration should not be longer than access attempt duration.'
        );
      }
    }
  }
}
