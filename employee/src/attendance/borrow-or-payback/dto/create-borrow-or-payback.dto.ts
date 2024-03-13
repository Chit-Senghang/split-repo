import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';
import { BorrowOrPaybackEnum } from '../common/enum/borrow-or-payback.enum';

export class CreateBorrowOrPaybackDto {
  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  employeeId: number;

  @ApiProperty({ type: Number, required: true, example: 'Format(YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsString()
  requestDate: string;

  @ApiProperty({ type: Date, required: true, example: 'Format 06:00' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ type: Date, required: true, example: 'Format 07:00' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional({
    type: String,
    enum: BorrowOrPaybackEnum,
    example: 'Format 07:00'
  })
  @IsNotEmpty()
  @IsIn(Object.keys(BorrowOrPaybackEnum))
  type: BorrowOrPaybackEnum;

  @ApiProperty({
    type: String,
    required: false,
    default: 'MaxLength(255) Optional column'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason: string;

  @ApiProperty({
    type: Number,
    required: false,
    default: 'optional column'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  paybackForRequestId: number;
}
