import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiRequestTimeoutResponse,
  ApiResponseOptions,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import { HttpMessage } from '../../ts/enum/http-message.enum';
import { getErrorResponseDto } from '../response-class/error-response.swagger';

export enum AvailableDecorator {
  OK = 'OK',
  CREATED = 'CREATED',
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  UNPROCESSABLE = 'UNPROCESSABLE',
  UNAUTHORIZE = 'UNAUTHORIZE',
  FORBIDDEN = 'FORBIDDEN',
  TIME_OUT = 'TIME_OUT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

const AVAILABLE_DECORATORS = {
  [AvailableDecorator.OK]: ApiOkResponse,
  [AvailableDecorator.CREATED]: ApiCreatedResponse,
  [AvailableDecorator.BAD_REQUEST]: ApiBadRequestResponse,
  [AvailableDecorator.NOT_FOUND]: ApiNotFoundResponse,
  [AvailableDecorator.UNPROCESSABLE]: ApiUnprocessableEntityResponse,
  [AvailableDecorator.UNAUTHORIZE]: ApiUnauthorizedResponse,
  [AvailableDecorator.FORBIDDEN]: ApiForbiddenResponse,
  [AvailableDecorator.TIME_OUT]: ApiRequestTimeoutResponse,
  [AvailableDecorator.INTERNAL_SERVER_ERROR]: ApiInternalServerErrorResponse
};

const DEFAULT_DECORATOR_PARAMS: Record<AvailableDecorator, ApiResponseOptions> =
  {
    [AvailableDecorator.OK]: {
      description: 'request Success'
    },
    [AvailableDecorator.CREATED]: {
      description: 'create success'
    },
    [AvailableDecorator.BAD_REQUEST]: {
      description: 'bad request',
      type: getErrorResponseDto(HttpMessage.BAD_REQUEST)
    },
    [AvailableDecorator.NOT_FOUND]: {
      description: 'resource not found',
      type: getErrorResponseDto(HttpMessage.NOT_FOUND)
    },
    [AvailableDecorator.UNPROCESSABLE]: {
      description: 'validation error',
      type: getErrorResponseDto(HttpMessage.UNPROCESSABLE_ENTITY)
    },
    [AvailableDecorator.UNAUTHORIZE]: {
      description: 'unauthorized',
      type: getErrorResponseDto(HttpMessage.UNAUTHORIZED)
    },
    [AvailableDecorator.FORBIDDEN]: {
      description: 'forbidden',
      type: getErrorResponseDto(HttpMessage.FORBIDDEN)
    },
    [AvailableDecorator.TIME_OUT]: {
      description: 'request timeout',
      type: getErrorResponseDto(HttpMessage.REQUEST_TIMEOUT)
    },
    [AvailableDecorator.INTERNAL_SERVER_ERROR]: {
      description: 'internal server error',
      type: getErrorResponseDto(HttpMessage.INTERNAL_SERVER_ERROR)
    }
  };

export function ApiBaseResponse(
  customizeParams?: Record<string, ApiResponseOptions | undefined | null>
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const inputDecoratorList = customizeParams ?? AvailableDecorator;

    Object.keys(inputDecoratorList).forEach((key) => {
      AVAILABLE_DECORATORS[key] &&
        AVAILABLE_DECORATORS[key]({
          ...DEFAULT_DECORATOR_PARAMS[key],
          ...(customizeParams && customizeParams[key] && customizeParams[key])
        })(target, propertyKey, descriptor);
    });
  };
}
