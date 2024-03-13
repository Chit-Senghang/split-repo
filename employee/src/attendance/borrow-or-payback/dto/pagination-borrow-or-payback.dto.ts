import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { BorrowOrPaybackEnum } from '../common/enum/borrow-or-payback.enum';
import {
  BasePaginationQueryDto,
  BasePaginationQueryProps
} from '../../../shared-resources/common/dto/base-pagination-query.dto';
import { StatusEnum } from '../../../shared-resources/common/enums/status.enum';

export class PaginationQueryBorrowOrPaybackDto extends OmitType(
  BasePaginationQueryDto,
  [BasePaginationQueryProps.ORDER_BY] as const
) {
  @ApiPropertyOptional({ required: false })
  @IsOptional()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  employeeId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(BorrowOrPaybackEnum))
  type: BorrowOrPaybackEnum;

  @ApiPropertyOptional()
  @IsOptional()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  fromDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  displayFullNameEn: string;

  @ApiPropertyOptional()
  @IsOptional()
  accountNo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(Object.values(StatusEnum))
  status: StatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastMovementDate: string;
}
