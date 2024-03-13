import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class Error {
  @ApiProperty({ type: String, default: '/path/to/error', required: false })
  public path?: string;

  @ApiProperty({ type: String, default: 'detail error message' })
  public message: string;
}

export class ErrorResponse {
  @ApiPropertyOptional({ type: Error, isArray: true })
  public errors?: Error[];
}

export function getErrorResponseDto(
  message = 'error message'
): typeof ErrorResponse {
  class ErrorResponseDto extends ErrorResponse {
    @ApiProperty({ type: String, default: message })
    public message: string;
  }
  Object.defineProperty(ErrorResponseDto, 'name', {
    value: `ErrorResponseDto`
  });

  return ErrorResponseDto;
}
