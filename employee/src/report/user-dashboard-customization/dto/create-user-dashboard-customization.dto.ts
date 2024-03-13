import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserDashboardCustomizationDto {
  @ApiProperty({ required: true, type: Number })
  @IsInt()
  @IsNotEmpty()
  reportId: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsNotEmpty()
  sizeWeight: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsNotEmpty()
  sizeHeight: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsNotEmpty()
  layoutWeight: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsNotEmpty()
  layoutHeight: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsNotEmpty()
  layoutX: number;

  @ApiProperty({ required: true, type: Number })
  @IsNumber()
  @IsNotEmpty()
  layoutY: number;
}
