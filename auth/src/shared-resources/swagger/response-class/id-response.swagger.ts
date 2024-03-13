import { ApiProperty } from '@nestjs/swagger';

export class IdResponseDto {
  @ApiProperty({ type: Number })
  public id: number;
}
