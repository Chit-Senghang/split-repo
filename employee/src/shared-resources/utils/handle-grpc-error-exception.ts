import { ResourceBadRequestException } from '../exception/badRequest.exception';

const handleGrpcErrorException = (exception: any) => {
  if (exception.code === 14) {
    throw new ResourceBadRequestException(
      'employee application',
      'employee application has not started yet'
    );
  }
};

export { handleGrpcErrorException };
