import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Book } from './entities/book.entity';
import { PAGINATION } from 'src/common/constants/pagination.constants';

@Controller('book')
export class BookController {
  private readonly defaultPage = PAGINATION.DEFAULT_PAGE;
  private readonly defaultLimit = PAGINATION.DEFAULT_LIMIT;

  constructor(private readonly bookService: BookService) {}

  @Post()
  @Auth()
  create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.bookService.create(createBookDto);
  }

  @Get()
  @Auth()
  findAll(
    @Query('page') page = this.defaultPage,
    @Query('limit') limit = this.defaultLimit,
  ): Promise<{ data: Book[]; total: number; page: number; limit: number }> {
    return this.bookService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id', MongoIdPipe) id: string): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id', MongoIdPipe) id: string) {
    return this.bookService.remove(id);
  }
}
