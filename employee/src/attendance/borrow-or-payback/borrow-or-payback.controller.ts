import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Query,
  HttpCode
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import { getErrorResponseDto } from '../../shared-resources/swagger/response-class/error-response.swagger';
import { ResponseMappingInterceptor } from '../../shared-resources/common/interceptor/response-mapping.interceptor';
import { BORROW_OR_PAYBACK_PERMISSION } from '../../shared-resources/ts/enum/permission/attendance/borrow-or-payback.enum';
import { IdResponseDto } from '../../shared-resources/swagger/response-class/id-response.swagger';
import { getPaginationResponseDto } from '../../shared-resources/swagger/response-class/get-pagination-response.swagger';
import { PermissionGuard } from '../../guards/permission.guard';
import { BorrowOrPaybackService } from './borrow-or-payback.service';
import { CreateBorrowOrPaybackDto } from './dto/create-borrow-or-payback.dto';
import { UpdateBorrowOrPaybackDto } from './dto/update-borrow-or-payback.dto';
import { BorrowOrPaybackRequest } from './entities/borrow-or-payback.entity';
import { PaginationQueryBorrowOrPaybackDto } from './dto/pagination-borrow-or-payback.dto';

@ApiBearerAuth()
@ApiBadRequestResponse({ type: getErrorResponseDto() })
@UseInterceptors(ResponseMappingInterceptor)
@ApiTags('borrow-or-payback')
@Controller('borrow-or-payback')
export class BorrowOrPaybackController {
  constructor(
    private readonly borrowOrPaybackService: BorrowOrPaybackService
  ) {}

  @UseGuards(
    PermissionGuard(BORROW_OR_PAYBACK_PERMISSION.CREATE_BORROW_OR_PAYBACK)
  )
  @ApiCreatedResponse({ type: IdResponseDto })
  @Post()
  create(@Body() createBorrowOrPaybackDto: CreateBorrowOrPaybackDto) {
    return this.borrowOrPaybackService.create(createBorrowOrPaybackDto);
  }

  @UseGuards(
    PermissionGuard(BORROW_OR_PAYBACK_PERMISSION.READ_BORROW_OR_PAYBACK)
  )
  @ApiOkResponse({ type: getPaginationResponseDto(BorrowOrPaybackRequest) })
  @Get()
  findAll(@Query() pagination: PaginationQueryBorrowOrPaybackDto) {
    return this.borrowOrPaybackService.findAll(pagination);
  }

  @UseGuards(
    PermissionGuard(BORROW_OR_PAYBACK_PERMISSION.READ_BORROW_OR_PAYBACK)
  )
  @ApiOkResponse({ type: BorrowOrPaybackRequest })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.borrowOrPaybackService.findOne(id);
  }

  @UseGuards(
    PermissionGuard(BORROW_OR_PAYBACK_PERMISSION.UPDATE_BORROW_OR_PAYBACK)
  )
  @ApiOkResponse({ type: IdResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateBorrowOrPaybackDto: UpdateBorrowOrPaybackDto
  ) {
    return this.borrowOrPaybackService.update(id, updateBorrowOrPaybackDto);
  }

  @UseGuards(
    PermissionGuard(BORROW_OR_PAYBACK_PERMISSION.DELETE_BORROW_OR_PAYBACK)
  )
  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number) {
    return this.borrowOrPaybackService.delete(id);
  }
}
