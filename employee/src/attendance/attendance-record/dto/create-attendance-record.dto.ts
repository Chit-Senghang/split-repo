import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateAttendanceRecordDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  fingerPrintId: string;

  @ApiProperty({
    type: Date,
    required: true
  })
  @IsString()
  scanTime: Date;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty()
  @Min(1)
  @IsNumber()
  companyStructureOutletId: number;
}
