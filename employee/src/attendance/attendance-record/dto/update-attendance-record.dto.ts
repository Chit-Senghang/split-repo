import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateAttendanceRecordDto {
  @ApiProperty({
    type: Date,
    required: true
  })
  @IsString()
  scanTime: Date;
}
