import { PartialType } from '@nestjs/swagger';
import { CreateBorrowOrPaybackDto } from './create-borrow-or-payback.dto';

export class UpdateBorrowOrPaybackDto extends PartialType(
  CreateBorrowOrPaybackDto
) {}
